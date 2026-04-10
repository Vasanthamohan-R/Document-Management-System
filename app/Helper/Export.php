<?php

namespace App\Helper;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

/**
 * --------------------------------------------------------------------------------
 * Export Data to Excel Format
 * --------------------------------------------------------------------------------
 * Generates Excel files with professional formatting, styled headers, and auto-sized columns.
 * Supports both headerless data exports and structured exports with formatted headers.
 * Creates downloadable Excel files with proper HTTP headers for browser download.
 *
 * @param  array  $data  Two-dimensional array containing the data to export
 * @param  array  $headers  Array of column headers for structured exports
 *
 * @author DMS Development Team
 *
 * @version 1.0.0
 *
 * @since 2026-04-09
 * --------------------------------------------------------------------------------
 */
class Export implements FromCollection, WithHeadings
{
    /**
     * Export data to be written to Excel
     *
     * @var array
     */
    protected $data;

    /**
     * Column headers for the Excel sheet
     *
     * @var array
     */
    protected $headers;

    public function __construct($data, $headers)
    {
        $this->data = $data;
        $this->headers = $headers;
    }

    public function headings(): array
    {
        return $this->headers;
    }

    public function collection()
    {
        return collect($this->data);
    }
}
