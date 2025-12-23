"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ColumnNames {
    passengerName: string;
    route: string;
    airlines: string;
    serviceType: string;
    amount: string;
}

interface ColumnNamesContextType {
    columnNames: ColumnNames;
    setColumnNames: (names: ColumnNames) => void;
    loading: boolean;
    saveColumnNames: () => Promise<void>;
}

const defaultColumnNames: ColumnNames = {
    passengerName: "Passenger Name",
    route: "Route",
    airlines: "Airlines",
    serviceType: "Type of Service",
    amount: "Amount",
};

const ColumnNamesContext = createContext<ColumnNamesContextType>({
    columnNames: defaultColumnNames,
    setColumnNames: () => {},
    loading: false,
    saveColumnNames: async () => {},
});

export const useColumnNames = () => useContext(ColumnNamesContext);

export const ColumnNamesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [columnNames, setColumnNamesState] = useState<ColumnNames>(defaultColumnNames);
    const [loading, setLoading] = useState(true);

    // Load column names on mount and when user changes
    useEffect(() => {
        const loadColumnNames = async () => {
            setLoading(true);
            try {
                if (user) {
                    // Load from API if user is logged in
                    const response = await fetch("/api/user/preferences");
                    if (response.ok) {
                        const data = await response.json();
                        setColumnNamesState({
                            ...defaultColumnNames,
                            ...(data.columnNames || {}),
                        });
                    } else {
                        // Fallback to defaults
                        setColumnNamesState(defaultColumnNames);
                    }
                } else {
                    // Load from localStorage if not logged in
                    const saved = localStorage.getItem("columnNames");
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            setColumnNamesState({
                                ...defaultColumnNames,
                                ...parsed,
                            });
                        } catch {
                            setColumnNamesState(defaultColumnNames);
                        }
                    } else {
                        setColumnNamesState(defaultColumnNames);
                    }
                }
            } catch (error) {
                console.error("Error loading column names:", error);
                setColumnNamesState(defaultColumnNames);
            } finally {
                setLoading(false);
            }
        };

        loadColumnNames();
    }, [user]);

    const setColumnNames = (names: ColumnNames) => {
        setColumnNamesState(names);
        // Save to localStorage immediately for non-logged-in users
        if (!user) {
            localStorage.setItem("columnNames", JSON.stringify(names));
        }
    };

    const saveColumnNames = async () => {
        if (!user) {
            // Already saved to localStorage in setColumnNames
            return;
        }

        try {
            const response = await fetch("/api/user/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnNames }),
            });

            if (!response.ok) {
                throw new Error("Failed to save column names");
            }
        } catch (error) {
            console.error("Error saving column names:", error);
            throw error;
        }
    };

    return (
        <ColumnNamesContext.Provider
            value={{
                columnNames,
                setColumnNames,
                loading,
                saveColumnNames,
            }}
        >
            {children}
        </ColumnNamesContext.Provider>
    );
};

