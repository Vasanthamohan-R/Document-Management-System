import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Facebook,
    Twitter,
    Linkedin,
    Github,
    Send,
    Shield,
    Users,
    Cloud,
    LifeBuoy,
    ChevronDown,
} from "lucide-react";
import LoginModal from "../../components/Popup/LoginModal";
import RegisterModal from "../../components/Popup/RegisterModal";

import logo from "@/assets/images/text_logo.png";
import { Alert } from "@/utils/Alert/Alert";
import axios from "axios";

export default function Landing() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    // Ref for contact section
    const contactRef = useRef<HTMLDivElement>(null);

    // Function to scroll to contact section
    const scrollToContact = () => {
        contactRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // language switch
    const [langDropdown, setLangDropdown] = useState(false);
    const [selectedLang, setSelectedLang] = useState({
        code: "en",
        label: "EN",
        flag: "data:image/png;base64,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",
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setLangDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.documentElement.style.scrollBehavior = "smooth";
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = [
        {
            code: "en",
            label: "EN",
            flag: "data:image/png;base64,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",
        },
        {
            code: "bm ",
            label: "BM",
            flag: "data:image/png;base64,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",
        },
    ];

    const handleLanguageChange = (lang: {
        code: string;
        label: string;
        flag: string;
    }) => {
        setSelectedLang(lang);
        setLangDropdown(false);
        console.log("Language switched to:", lang.code);
        // Add your i18n logic here
    };

    const slides = [
        {
            image: "https://static.vecteezy.com/system/resources/previews/038/599/395/non_2x/twitter-banner-for-technology-company-editor_template.jpeg",
        },
        {
            image: "https://info.aiim.org/hubfs/AIIM_Blog/Five%20Key%20Capabilities%20of%20Document%20Management%20Cover.jpg",
        },
        {
            image: "https://newgensoft.com/in/wp-content/uploads/sites/3/2025/03/Electronic-Document-Management-scaled.jpg",
        },
    ];

    const [index, setIndex] = useState(0);

    const next = () => {
        setIndex((prev) => (prev + 1) % slides.length);
    };

    const prev = () => {
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    /* Auto Slide */
    useEffect(() => {
        const interval = setInterval(() => {
            next();
        }, 4000); // 4 seconds

        return () => clearInterval(interval);
    }, []);

    // FAQ Accordion
    const faqs = [
        {
            icon: <Shield className="w-6 h-6 text-white" />,
            q: "How secure is my data?",
            a: "We use end-to-end encryption and role-based access to ensure your documents are fully protected.",
        },
        {
            icon: <Users className="w-6 h-6 text-white" />,
            q: "Can I collaborate with my team?",
            a: "Yes! You can share documents, assign workflows, and track changes with your team easily.",
        },
        {
            icon: <Cloud className="w-6 h-6 text-white" />,
            q: "Do you provide cloud storage?",
            a: "Absolutely. Access your documents from anywhere with our secure cloud storage.",
        },
        {
            icon: <LifeBuoy className="w-6 h-6 text-white" />,
            q: "What kind of support is available?",
            a: "We offer 24/7 customer support and a rich documentation library for all users.",
        },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    //handle submission
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        setLoading(true);

        try {
            await axios.post("/api/v1/contact/store", form);

            Alert.Success("Message sent successfully!");

            setForm({ name: "", email: "", message: "" });
            setErrors({});
        } catch (error: any) {
            if (error.response?.status === 422) {
                const errs = error.response.data.errors;
                setErrors(errs);

                // 🔥 Show alert ALSO
                const firstError = Object.values(errs)[0] as string[];
            } else {
                Alert.Error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    //State for Register and
    const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

    return (
        <div className="bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
                <div className="max-w-[90%] mx-auto flex items-center justify-between h-20 px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer">
                        <img src={logo} className="h-9 w-auto" />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-10 text-gray-600 dark:text-gray-300 font-medium">
                        <a className="relative hover:text-brand transition group">
                            Home
                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-brand transition-all group-hover:w-full"></span>
                        </a>

                        <a className="relative hover:text-brand transition group">
                            Features
                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-brand transition-all group-hover:w-full"></span>
                        </a>

                        <a className="relative hover:text-brand transition group">
                            Pricing
                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-brand transition-all group-hover:w-full"></span>
                        </a>

                        <a
                            onClick={scrollToContact}
                            className="relative hover:text-brand transition group cursor-pointer"
                        >
                            Contact
                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-brand transition-all group-hover:w-full"></span>
                        </a>
                    </nav>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Language Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="flex items-center gap-1 border border-gray-300 dark:border-slate-700 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                onClick={() => setLangDropdown(!langDropdown)}
                            >
                                <img
                                    src={selectedLang.flag}
                                    alt={selectedLang.label}
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {selectedLang.label}
                                </span>
                            </button>

                            {langDropdown && (
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                            onClick={() =>
                                                handleLanguageChange(lang)
                                            }
                                        >
                                            <img
                                                src={lang.flag}
                                                alt={lang.label}
                                                className="w-5 h-5 rounded-full"
                                            />
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">
                                                {lang.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="flex gap-3">
                            <button
                                className="border border-brand  px-6 py-2 rounded-full text-brand hover:text-white hover:bg-brand transition"
                                onClick={() => setAuthMode("login")}
                            >
                                Login
                            </button>
                            <button
                                className="bg-brand text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition"
                                onClick={() => setAuthMode("register")}
                            >
                                Sign Up
                            </button>{" "}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Slider */}
            <section className="relative h-[70vh] overflow-hidden">
                {/* Slider */}
                <motion.div
                    className="flex h-full"
                    animate={{ x: `-${index * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {slides.map((slide, i) => (
                        <div key={i} className="min-w-full h-full">
                            <img
                                src={slide.image}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Left Arrow */}
                <button
                    onClick={prev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3 rounded-full shadow hover:scale-110 transition text-gray-800 dark:text-white"
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={next}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3 rounded-full shadow hover:scale-110 transition text-gray-800 dark:text-white"
                >
                    <ChevronRight size={22} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-8 w-full flex justify-center gap-3">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`cursor-pointer rounded-full transition-all ${
                                i === index
                                    ? "w-8 h-3 bg-brand"
                                    : "w-3 h-3 bg-white/70"
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Trusted Section */}
            <section className="py-20 pb-30 bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    {/* Title */}
                    <h2 className="text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-4">
                        Trusted by Leading Companies
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 mb-16 text-xl">
                        Organizations around the world rely on our platform
                    </p>

                    {/* Logo Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 items-center">
                        <div className="flex justify-center items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-400 dark:text-gray-500 text-xl font-semibold hover:text-gray-800 dark:hover:text-white transition">
                            <img
                                className="h-10 w-10"
                                src="data:image/png;base64,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"
                                alt=""
                            />
                            <span>Google</span>
                        </div>

                        <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-gray-400 text-xl font-semibold hover:text-gray-800 transition">
                            <img
                                className="h-10 w-10"
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAABJlBMVEX////qQzU0qFNChfT7vAUjePPU4Pw9g/RakfX3+v7t8v5ek/b7ugD7uAD/vQAwp1AmpUrpMyHqPzDpOCf86ejoKxWExJI1f/QaokP++vrpMBz5z837tAD//Pfr9e3wioTrVEnoHgD2ubbrTUHve3RMivXj6/1run3N5tIAnzn1sa3zoJzuc2vyl5Lwg333w8DtZl3739394K38wwD8wDT+68r7xUj+8NfpNzf92Jj91ID8zWz8xVV1ofb+8+IVplbNtiiMr/eq1bO8z/pRsGiZzaS93sT4war1lhb3pBjuaC3ygyTzjCHsTzLwdijtXwCpwvlyqC5OqU+5tDGFrkLquhdiq0qbsDvE16tAjtQ+ksU4nJY3onxBiuQ5l6s4now8lbhnspgK8I0SAAAHLElEQVR4nO2ZaXfaRhSGJRmH2AY0WgAhjNjsiNVAvDVpHCcEaNI1TZqmadI2/f9/oiMBZplFI80I6Dl+vxgf+wyP3nvnzr0jSbrXve71/5Q5KNZa7fJZx9dZuduq9Qbm9ngKg9ZZvyLrtq0ZhqFDwR+aZhtypd9pFwuFjQMVWyd21YYoMkaQT6tW+93eBi0rFMsVHRoSIF0z6p3aZvwqdutVA2sQzrKsfdaLm6vQq+gaI9FMhlFvxRlGs1WvhiOa+pU1uoO4kNpySJMW0vRyHG4VWrIdkWiKZbSF51avzprcZCxZbMqbJ1leJNnLrRNxMSy0tMCixCbDaAliMjtZMUie7BMhIezpgmyaypCL/ExtW0A2LUvXapxIZp+rDuBln3GF0Oxr4plkOcuTWAMRhQAnQ45MVZRjYpLtTlSoYpTDl0nZcmSf4kLiqFWDalxM0X0axJZPWmSfzLj2HYdPZj82n6IXzk4MddxXdJ+kVqi2wJtB/VlUn30i/yuHT70QPmlVo19u13rFAVSxV2t3O3KV1Mpz+FRg3Xi6ode7RXPt4QvmoF2Rcc0zh0/SCVv/pFcrbWJrNGj1kfMgexYZSaoxJZRu9OljQKHYN1aeTitH98mkJerCpT5D/1jsLFU7Hp+kMkPwjDrjsAQHMwE+ScXg4OnVLvOkZJanqcXlk1QJDJ5RCdX517y9bPP4JNUCg5fthxwozbqWPeFAksxAo+xu+EU7XD5J3wVlVLYdYVW+28/SxesAn3hHtgh6nD5/89M3FKYoPnGqdJFKnCe+J1JlRd1OhNHlccLTDwQqm6vWRNVVyocihNDobIPpOjHXMYZK17bycuNJ+o7qHA2hIeAGJ7y8NF9Q/bhGZWwloaTr48SSzldDqEe/keDS01RilWq5NmjbqAYwelerUCuJpfe3wiRdJhCdv5lTVXvbgXqcRqkSsxAa/e1klPTtevSm+tmjMrZwDnsq4YzyQvgaUtW3ZNTzYzyUd+ho4Rs7McKm1JQq/cu23p4TUsrXVYllhYMHnEKXfEaGSj9heqzD030+HayviJbOhVKXbFBHyT0e7R+ur3h9QY7eBVP0+KGQ+F1SjLpiYuKGyr9aX5G8+RLppxuCehkC6pgtpfihbtZXfEKBer4ZqOTR+opPyVCprUGRa2eKcfPxQz1cL1QUKLZ6LgJqvVCRC3rq2Yag9k53EurRPVREqB1I9FBQmyoJKNQOFE909+3CMYPUqR04kNGKvgOtC3r27UCTh0LtQDucRPqpHRgc0M5TxIjFC/UWWZIyjDLW9MOjfDJQFCh0mqFsv0ziV4cJ6uZhoI5OKVDrBZ1ywZF58Q6MWaCkAwa9zZOhkAmZdBWUyby/VVSFCYpFN0So5BEKhU+qTOK3W0VRwEQQ0yHZKMzmwydV5sPvHpMCXEFQD/bJUOjmw17EZl74SFDNhhioG/L2SyJTu4Qpn5nMxzmTooqx6pCy+ZBuytfa5f48dFOJySrK3kNPPl+rr0EyH94tMQnagA/J0cPm+eoLI78SrAjk+JlekdMcV899LbrPTOLjGhOk4s71A4pRe0lMlfJ0TQjdLIAq02FDESWjSNGT7l7XZl4gRCIC+IgSPMw13lz+i21c6KayuKgO6J0NIXrTVJ8dLHiqIQfUS0rwMLd4Cz1Ow9ARmbioaDuPvPc8lS7ek4m8ZLei1tBXNJ8w09Wy/rCoUJG9ohzEfvRwh/GdHFi6A7yKQkX3CTqFvGxY0RAEWKVYLuOFx0Jv6T5RitRMowCrYL0ahavtB+Rucw6FbRCW1AjKKhjC5jiEWZNPAT4FGyVJucAAhjHLcS3wZ54+ECaDjILLMEBBs1wWLGdswdWan6lUDEZBv4MD6JkF3EZAEJ2cOn1A8OUvSneHXEth5bJ45bk1GpMbB2foNu/WAconIhX5KF5dL6hY3WEBdTRuoGCOMx6pYPnRVOtvQggJbTAqtgDOvq2puLnhpOH4ajSG45yrNC3ksZr/nGLNYsjymcbsVF73BzypqvfB+4z3GdziEosxeL4Y0yqUVOUrUrFoLQsiJ7iwR6CyPu+tJhbjzrujasZApVhfVhOL1kbh1IiBCSaWulwb6B0LlqoZB5UKFom1z1LK16liSHao5jyEoZI8Zq/gae7XhjzukoyFSo0j2+Eu/JpP5lkrOcarmKg+52+i+eTJGcWUWP9GRpL8Ji0GJisXus9f1Rg9XDmlAp5Je6qJKjaEgP9SSRIdQsvlvVKaaQhEmQUEhG4uxxVTHCymeYNZE4XQvIWxSRVn00xDlS+1AKDMGZHljDncAmouBqQZVqTcUi0QF5Kn0gQOTyG5AKANiGLUgHYxc6mg2cyJejFHVamRGylWcOkCFhi5mGE1NjWGrtW0AKHjgiMg/Ks7nmyQaCZnmBuNoB/WYhgF8Dd4go/g1Lx5ngWY05h4o/pMudx44s3w2wO6173uxaP/AIK0/RNTySIXAAAAAElFTkSuQmCC"
                                alt=""
                            />
                            <span>Amazon</span>
                        </div>
                        <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-gray-400 text-xl font-semibold hover:text-gray-800 transition">
                            <img
                                className="h-10 w-10"
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAABJlBMVEX////qQzU0qFNChfT7vAUjePPU4Pw9g/RakfX3+v7t8v5ek/b7ugD7uAD/vQAwp1AmpUrpMyHqPzDpOCf86ejoKxWExJI1f/QaokP++vrpMBz5z837tAD//Pfr9e3wioTrVEnoHgD2ubbrTUHve3RMivXj6/1run3N5tIAnzn1sa3zoJzuc2vyl5Lwg333w8DtZl3739394K38wwD8wDT+68r7xUj+8NfpNzf92Jj91ID8zWz8xVV1ofb+8+IVplbNtiiMr/eq1bO8z/pRsGiZzaS93sT4war1lhb3pBjuaC3ygyTzjCHsTzLwdijtXwCpwvlyqC5OqU+5tDGFrkLquhdiq0qbsDvE16tAjtQ+ksU4nJY3onxBiuQ5l6s4now8lbhnspgK8I0SAAAHLElEQVR4nO2ZaXfaRhSGJRmH2AY0WgAhjNjsiNVAvDVpHCcEaNI1TZqmadI2/f9/oiMBZplFI80I6Dl+vxgf+wyP3nvnzr0jSbrXve71/5Q5KNZa7fJZx9dZuduq9Qbm9ngKg9ZZvyLrtq0ZhqFDwR+aZhtypd9pFwuFjQMVWyd21YYoMkaQT6tW+93eBi0rFMsVHRoSIF0z6p3aZvwqdutVA2sQzrKsfdaLm6vQq+gaI9FMhlFvxRlGs1WvhiOa+pU1uoO4kNpySJMW0vRyHG4VWrIdkWiKZbSF51avzprcZCxZbMqbJ1leJNnLrRNxMSy0tMCixCbDaAliMjtZMUie7BMhIezpgmyaypCL/ExtW0A2LUvXapxIZp+rDuBln3GF0Oxr4plkOcuTWAMRhQAnQ45MVZRjYpLtTlSoYpTDl0nZcmSf4kLiqFWDalxM0X0axJZPWmSfzLj2HYdPZj82n6IXzk4MddxXdJ+kVqi2wJtB/VlUn30i/yuHT70QPmlVo19u13rFAVSxV2t3O3KV1Mpz+FRg3Xi6ode7RXPt4QvmoF2Rcc0zh0/SCVv/pFcrbWJrNGj1kfMgexYZSaoxJZRu9OljQKHYN1aeTitH98mkJerCpT5D/1jsLFU7Hp+kMkPwjDrjsAQHMwE+ScXg4OnVLvOkZJanqcXlk1QJDJ5RCdX517y9bPP4JNUCg5fthxwozbqWPeFAksxAo+xu+EU7XD5J3wVlVLYdYVW+28/SxesAn3hHtgh6nD5/89M3FKYoPnGqdJFKnCe+J1JlRd1OhNHlccLTDwQqm6vWRNVVyocihNDobIPpOjHXMYZK17bycuNJ+o7qHA2hIeAGJ7y8NF9Q/bhGZWwloaTr48SSzldDqEe/keDS01RilWq5NmjbqAYwelerUCuJpfe3wiRdJhCdv5lTVXvbgXqcRqkSsxAa/e1klPTtevSm+tmjMrZwDnsq4YzyQvgaUtW3ZNTzYzyUd+ho4Rs7McKm1JQq/cu23p4TUsrXVYllhYMHnEKXfEaGSj9heqzD030+HayviJbOhVKXbFBHyT0e7R+ur3h9QY7eBVP0+KGQ+F1SjLpiYuKGyr9aX5G8+RLppxuCehkC6pgtpfihbtZXfEKBer4ZqOTR+opPyVCprUGRa2eKcfPxQz1cL1QUKLZ6LgJqvVCRC3rq2Yag9k53EurRPVREqB1I9FBQmyoJKNQOFE909+3CMYPUqR04kNGKvgOtC3r27UCTh0LtQDucRPqpHRgc0M5TxIjFC/UWWZIyjDLW9MOjfDJQFCh0mqFsv0ziV4cJ6uZhoI5OKVDrBZ1ywZF58Q6MWaCkAwa9zZOhkAmZdBWUyby/VVSFCYpFN0So5BEKhU+qTOK3W0VRwEQQ0yHZKMzmwydV5sPvHpMCXEFQD/bJUOjmw17EZl74SFDNhhioG/L2SyJTu4Qpn5nMxzmTooqx6pCy+ZBuytfa5f48dFOJySrK3kNPPl+rr0EyH94tMQnagA/J0cPm+eoLI78SrAjk+JlekdMcV899LbrPTOLjGhOk4s71A4pRe0lMlfJ0TQjdLIAq02FDESWjSNGT7l7XZl4gRCIC+IgSPMw13lz+i21c6KayuKgO6J0NIXrTVJ8dLHiqIQfUS0rwMLd4Cz1Ow9ARmbioaDuPvPc8lS7ek4m8ZLei1tBXNJ8w09Wy/rCoUJG9ohzEfvRwh/GdHFi6A7yKQkX3CTqFvGxY0RAEWKVYLuOFx0Jv6T5RitRMowCrYL0ahavtB+Rucw6FbRCW1AjKKhjC5jiEWZNPAT4FGyVJucAAhjHLcS3wZ54+ECaDjILLMEBBs1wWLGdswdWan6lUDEZBv4MD6JkF3EZAEJ2cOn1A8OUvSneHXEth5bJ45bk1GpMbB2foNu/WAconIhX5KF5dL6hY3WEBdTRuoGCOMx6pYPnRVOtvQggJbTAqtgDOvq2puLnhpOH4ajSG45yrNC3ksZr/nGLNYsjymcbsVF73BzypqvfB+4z3GdziEosxeL4Y0yqUVOUrUrFoLQsiJ7iwR6CyPu+tJhbjzrujasZApVhfVhOL1kbh1IiBCSaWulwb6B0LlqoZB5UKFom1z1LK16liSHao5jyEoZI8Zq/gae7XhjzukoyFSo0j2+Eu/JpP5lkrOcarmKg+52+i+eTJGcWUWP9GRpL8Ji0GJisXus9f1Rg9XDmlAp5Je6qJKjaEgP9SSRIdQsvlvVKaaQhEmQUEhG4uxxVTHCymeYNZE4XQvIWxSRVn00xDlS+1AKDMGZHljDncAmouBqQZVqTcUi0QF5Kn0gQOTyG5AKANiGLUgHYxc6mg2cyJejFHVamRGylWcOkCFhi5mGE1NjWGrtW0AKHjgiMg/Ks7nmyQaCZnmBuNoB/WYhgF8Dd4go/g1Lx5ngWY05h4o/pMudx44s3w2wO6173uxaP/AIK0/RNTySIXAAAAAElFTkSuQmCC"
                                alt=""
                            />
                            <span>Microsoft</span>
                        </div>
                        <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-gray-400 text-xl font-semibold hover:text-gray-800 transition">
                            <img
                                className="h-10 w-10"
                                src="data:image/png;base64,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"
                                alt=""
                            />
                            <span>IBM</span>
                        </div>
                        <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-gray-400 text-xl font-semibold hover:text-gray-800 transition">
                            <img
                                className="h-10 w-10"
                                src="data:image/png;base64,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"
                                alt=""
                            />
                            <span>Oracle</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Title */}
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
                        Powerful Document Management Features
                    </h2>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Feature Items */}
                        {[
                            {
                                title: "Document Storage",
                                desc: "Securely store unlimited files and organize them with folders and metadata.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/folder-invoices.png",
                            },
                            {
                                title: "Advanced Search",
                                desc: "Quickly locate files using smart search filters and indexing.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/search.png",
                            },
                            {
                                title: "Version Control",
                                desc: "Track document history and restore previous versions easily.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/synchronize.png",
                            },
                            {
                                title: "Workflow Automation",
                                desc: "Automate approvals, reviews, and document lifecycle processes.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/automation.png",
                            },
                            {
                                title: "Access Control",
                                desc: "Manage user permissions and role-based document access.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/lock.png",
                            },
                            {
                                title: "Audit Logs",
                                desc: "Track every document activity for compliance and monitoring.",
                                img: "https://img.icons8.com/ios-filled/100/33459b/activity-history.png",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-blue-50 dark:bg-slate-900 p-8 rounded-3xl transition transform hover:-translate-y-1 border border-transparent hover:border-brand flex flex-col items-center text-center"
                            >
                                {/* Feature Icon */}
                                <div className="mb-6">
                                    <img
                                        src={feature.img}
                                        alt={feature.title}
                                        className="h-16 w-16"
                                    />
                                </div>

                                {/* Feature Title */}
                                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>

                                {/* Feature Description */}
                                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center gap-20">
                    {/* Text & Workflow List */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
                            Streamline Your Document Workflow
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                            Automate document processes from creation to
                            approval, ensuring faster collaboration, efficiency,
                            and productivity.
                        </p>

                        <ul className="space-y-4">
                            {[
                                {
                                    text: "Upload and organize documents",
                                    icon: "https://img.icons8.com/ios-filled/24/33459b/upload.png",
                                },
                                {
                                    text: "Assign approval workflows",
                                    icon: "https://img.icons8.com/ios-filled/24/33459b/task.png",
                                },
                                {
                                    text: "Track document lifecycle",
                                    icon: "https://img.icons8.com/ios-filled/24/33459b/synchronize.png",
                                },
                                {
                                    text: "Manage version history",
                                    icon: "https://img.icons8.com/ios-filled/24/33459b/version-control.png",
                                },
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 text-gray-700 hover:text-brand transition"
                                >
                                    <img
                                        src={item.icon}
                                        alt=""
                                        className="w-6 h-6"
                                    />
                                    <span className="text-lg font-medium">
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dashboard Preview Image */}
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFCLuebfUs_cZfLS0quJ6JkxWqbOqePpvONw&s"
                        alt="Dashboard Preview"
                        className="w-full rounded-3xl shadow-2xl border border-gray-200 hover:scale-105 transform transition duration-500"
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-28 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-center text-white overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

                <h2 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                    Start Managing Documents Smarter
                </h2>

                <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-sm">
                    Try our document management system today and streamline your
                    workflow effortlessly.
                </p>

                <div className="flex justify-center gap-4 flex-wrap">
                    <button className="bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition transform">
                        Start Free Trial
                    </button>

                    <button className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition">
                        Learn More
                    </button>
                </div>
            </section>

            <section className="py-24 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4 text-blue-950 dark:text-white">
                        Why Choose Us
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
                        Discover the key features that make our document
                        management system efficient, secure, and easy to use.
                    </p>

                    {/* Single card container */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl flex flex-col md:flex-row">
                        {/* Feature 1 */}
                        <div className="flex-1 p-4 md:border-r md:border-gray-200 dark:border-slate-700">
                            <img
                                src="https://img.icons8.com/color/96/document.png"
                                alt="Secure Storage"
                                className="mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2 dark:text-white">
                                Secure Storage
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Keep all your documents safe and encrypted with
                                industry-standard security.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex-1 p-4 md:border-r md:border-gray-200 dark:border-slate-700">
                            <img
                                src="https://img.icons8.com/color/96/search.png"
                                alt="Smart Search"
                                className="mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2 dark:text-white">
                                Smart Search
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Quickly find any file with our AI-powered smart
                                search and filters.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex-1 p-4">
                            <img
                                src="https://img.icons8.com/color/96/settings.png"
                                alt="Workflow Automation"
                                className="mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2 dark:text-white">
                                Workflow Automation
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Automate approvals, reviews, and document
                                lifecycle to save time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {faqs.map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => toggleFAQ(i)}
                            >
                                {/* Left: Icon + Question */}
                                <div className="flex items-start md:items-center gap-4 flex-1">
                                    <div className="flex-shrink-0 bg-brand w-12 h-12 rounded-full flex items-center justify-center">
                                        {item.icon}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {item.q}
                                        </h3>
                                        <p
                                            className={`mt-2 text-gray-600 text-base leading-relaxed transition-all duration-300 overflow-hidden ${
                                                openIndex === i
                                                    ? "max-h-96 opacity-100"
                                                    : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            {item.a}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Chevron */}
                                <div className="flex-shrink-0 mt-4 md:mt-0">
                                    <ChevronDown
                                        className={`w-6 h-6 text-brand transition-transform duration-300 ${
                                            openIndex === i ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50"
                ref={contactRef}
                id="contact"
            >
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-gray-800">
                            Get in Touch
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Have questions, need support, or want a demo? Fill
                            out the form and our team will respond promptly.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-brand/10 p-3 rounded-full">
                                    <img
                                        src="https://img.icons8.com/color/48/000000/marker.png"
                                        alt="Address"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <p className="text-gray-700 font-medium">
                                    123 Main Street, City, Country
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-brand/10 p-3 rounded-full">
                                    <img
                                        src="https://img.icons8.com/color/48/000000/new-post.png"
                                        alt="Email"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <p className="text-gray-700 font-medium">
                                    support@dms.com
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-brand/10 p-3 rounded-full">
                                    <img
                                        src="https://img.icons8.com/color/48/000000/phone.png"
                                        alt="Phone"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <p className="text-gray-700 font-medium">
                                    +1 234 567 890
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    {/* Contact Form */}
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="bg-white p-10 rounded-3xl space-y-6"
                    >
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                className={`w-full border rounded-xl px-4 py-3 outline-none transition
    ${
        errors.name
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand"
    }
  `}
                            />

                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`w-full border rounded-xl px-4 py-3 outline-none transition
    ${
        errors.email
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand"
    }
  `}
                            />

                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Your message..."
                                className={`w-full border rounded-xl px-4 py-3 h-40 resize-none outline-none transition
    ${
        errors.message
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand"
    }
  `}
                            />

                            {errors.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.message[0]}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold transition duration-300
                            ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-brand text-white hover:scale-105 hover:shadow-lg"
                            }`}
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <Send />
                            )}

                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-gray-400 pt-16 pb-8 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-12">
                    <div className="md:col-span-2">
                        <img src={logo} className="h-15 w-50 mb-4" />

                        <p className="mb-6">
                            A modern document management platform designed to
                            securely store and organize business files.
                        </p>

                        <div className="flex gap-4">
                            <div className="p-2 bg-blue-500 text-white rounded-lg hover:bg-brand cursor-pointer transition">
                                <Facebook size={18} />
                            </div>

                            <div className="p-2 bg-gray-800 text-white rounded-lg hover:bg-brand cursor-pointer transition">
                                <Twitter size={18} />
                            </div>

                            <div className="p-2 bg-blue-800 text-white rounded-lg hover:bg-brand cursor-pointer transition">
                                <Linkedin size={18} />
                            </div>

                            <div className="p-2 bg-gray-800 rounded-lg hover:bg-brand cursor-pointer transition">
                                <Github size={18} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-blue-900 dark:text-white font-bold mb-4">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            <li className="hover:text-brand cursor-pointer">
                                Features
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Workflow
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Security
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Pricing
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-blue-900 dark:text-white font-bold mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            <li className="hover:text-brand cursor-pointer">
                                About
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Careers
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Blog
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-blue-900 dark:text-white font-bold mb-4">
                            Support
                        </h3>

                        <ul className="space-y-3">
                            <li className="hover:text-brand cursor-pointer">
                                Help Center
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Documentation
                            </li>

                            <li className="hover:text-brand cursor-pointer">
                                Contact
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 mt-16 border-t border-gray-200 dark:border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>
                        © {new Date().getFullYear()} Document Management System
                    </p>

                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="hover:text-brand cursor-pointer">
                            Privacy Policy
                        </span>

                        <span className="hover:text-brand cursor-pointer">
                            Terms
                        </span>
                    </div>
                </div>
            </footer>
            {/* modals */}
            <LoginModal
                isOpen={authMode === "login"}
                onClose={() => setAuthMode(null)}
                SwitchToRegister={() => setAuthMode("register")}
            />
            <RegisterModal
                isOpen={authMode === "register"}
                onClose={() => setAuthMode(null)}
                SwitchToLogin={() => setAuthMode("login")}
            />
        </div>
    );
}
