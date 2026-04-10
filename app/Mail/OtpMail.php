<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Class RegisterOtpMail
 *
 * Mailable class responsible for sending
 * OTP verification emails during user registration,forgot password(changeing password).
 *
 * This email contains the One Time Password (OTP)
 * used to verify the user's email address.
 *
 *
 * @author Paramesh Guna
 *
 * @created 08-03-2026
 *
 * @version 1.0
 */
class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * User instance
     *
     * @var mixed
     */
    public $user;

    /**
     * OTP code
     *
     * @var string
     */
    public $otp;

    /**
     * Purpose of the OTP
     *
     * @var string
     */
    public $purpose;

    /**
     * Create a new message instance.
     *
     * Initializes the email with user details
     * and the generated OTP code.
     *
     * @param  mixed  $user
     *
     * @since 1.0.0
     */
    public function __construct($user, ?string $otp = null, string $purpose = 'registration')
    {
        $this->user = $user;
        $this->otp = $otp;
        $this->purpose = $purpose;
    }

    /**
     * Get the message envelope.
     *
     * Defines the email subject and metadata.
     *
     *
     * @since 1.0.0
     */
    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'registration' ? 'Your Registration OTP - '.config('app.name') : 'Your Password Reset OTP - '.config('app.name');

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     *
     * Specifies the Blade template used
     * to render the email body.
     *
     *
     * @since 1.0.0
     */
    public function content(): Content
    {
        $contentView = $this->purpose === 'registration' ? 'email.register-otp' : 'email.password-reset-otp';

        return new Content(

            view: $contentView,
            with: [
                'user' => $this->user,
                'otp' => $this->otp,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * Currently no attachments are included.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     *
     * @since 1.0.0
     */
    public function attachments(): array
    {
        return [];
    }
}
