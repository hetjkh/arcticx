"use client";

import { useState } from "react";
import { InvoiceType } from "@/types";
import { formatNumberWithCommas } from "@/lib/helpers";
import { DATE_OPTIONS } from "@/lib/variables";

// ShadCn
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BaseButton } from "@/app/components";

type StatementPreviewModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoices: InvoiceType[];
};

const StatementPreviewModal = ({
    open,
    onOpenChange,
    invoices,
}: StatementPreviewModalProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Calculate total amount
    const totalAmount = invoices.reduce((sum, invoice) => {
        return sum + (Number(invoice.details.totalAmount) || 0);
    }, 0);

    // Get currency from first invoice (assuming all invoices use same currency)
    const currency = invoices[0]?.details.currency || "USD";

    // Sort invoices by date
    const sortedInvoices = [...invoices].sort((a, b) => {
        const dateA = new Date(a.details.invoiceDate).getTime();
        const dateB = new Date(b.details.invoiceDate).getTime();
        return dateA - dateB;
    });

    // Format date like "21-Dec-22"
    const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/invoice/statement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ invoices }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate statement");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `statement-${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error generating statement:", error);
            alert("Failed to generate statement. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]">
                <DialogHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-2xl uppercase">Statement Preview</DialogTitle>
                            <DialogDescription className="mt-2">
                                Preview of {invoices.length} selected invoice{invoices.length !== 1 ? 's' : ''}
                            </DialogDescription>
                        </div>
                        <BaseButton
                            onClick={handleDownload}
                            disabled={isGenerating}
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isGenerating ? "Generating..." : "Download PDF"}
                        </BaseButton>
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    {/* Table */}
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                            DATE
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                            TICKET NO
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                            NAME
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                            ROUTE
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase whitespace-nowrap">
                                            AMOUNT
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedInvoices.map((invoice, index) => {
                                        const invoiceDate = new Date(invoice.details.invoiceDate);
                                        const formattedDate = formatDate(invoiceDate);

                                        // Get route from items description or service type
                                        const route = invoice.details.items
                                            .map((item) => {
                                                if (item.description) return item.description;
                                                if (item.serviceType) return item.serviceType;
                                                return item.name;
                                            })
                                            .filter(Boolean)
                                            .join(", ") || "-";

                                        // Get name from receiver
                                        const name = invoice.receiver.name || "-";

                                        return (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-900"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                                    {invoice.details.invoiceNumber || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                                                    {name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                                                    {route}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-medium whitespace-nowrap">
                                                    {formatNumberWithCommas(Number(invoice.details.totalAmount) || 0)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Total Row */}
                                    <tr className="bg-gray-200 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-700 font-bold">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700" colSpan={3}></td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700">
                                            TOTAL
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right whitespace-nowrap">
                                            {formatNumberWithCommas(totalAmount)} {currency}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>Total Invoices: {invoices.length} | Total Amount: {formatNumberWithCommas(totalAmount)} {currency}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StatementPreviewModal;

