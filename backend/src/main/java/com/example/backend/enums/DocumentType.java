package com.example.backend.enums;

public enum DocumentType {
    RECEIPT,          // Store receipts
    INVOICE,          // Invoices from vendors
    BANK_STATEMENT,   // Monthly bank statements
    CONTRACT,         // Rental/service contracts
    PROOF_OF_PAYMENT, // Payment confirmations
    OTHER             // Any other document
}