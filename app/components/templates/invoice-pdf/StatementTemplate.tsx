import React from "react";
import { InvoiceType } from "@/types";
import { formatNumberWithCommas } from "@/lib/helpers";
import { DATE_OPTIONS } from "@/lib/variables";

type StatementData = {
    invoices: InvoiceType[];
    title?: string;
};

const StatementTemplate = (data: StatementData) => {
    const { invoices, title = "STATEMENT" } = data;

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

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase">{title}</h1>
                </div>

                {/* Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                                    DATE
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                                    TICKET NO
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                                    NAME
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                                    ROUTE
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase">
                                    AMOUNT
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedInvoices.map((invoice, index) => {
                                const invoiceDate = new Date(invoice.details.invoiceDate);
                                const day = invoiceDate.getDate();
                                const month = invoiceDate.toLocaleDateString("en-US", { month: "short" });
                                const year = invoiceDate.getFullYear().toString().slice(-2);
                                const formattedDate = `${day}-${month}-${year}`;

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
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">
                                            {formattedDate}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">
                                            {invoice.details.invoiceNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">
                                            {name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-300">
                                            {route}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                                            {formatNumberWithCommas(Number(invoice.details.totalAmount) || 0)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Total Row */}
                            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300"></td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300"></td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300"></td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                                    TOTAL
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    {formatNumberWithCommas(totalAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Generated on {new Date().toLocaleDateString("en-US", DATE_OPTIONS)}</p>
                    <p className="mt-1">Total Invoices: {invoices.length}</p>
                </div>
            </div>
        </div>
    );
};

export default StatementTemplate;

