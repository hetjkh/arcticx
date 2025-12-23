"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";

// RHF
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

// ShadCn
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// DnD
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    UniqueIdentifier,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Components
import { BaseButton, SingleItem, Subheading, FormInput } from "@/app/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";
import { useColumnNames } from "@/contexts/ColumnNamesContext";

// Icons
import { Plus } from "lucide-react";

// Types
import { InvoiceType } from "@/types";

const Items = () => {
    const { control, setValue } = useFormContext<InvoiceType>();

    const { _t } = useTranslationContext();

    const ITEMS_NAME = "details.items";
    const { fields, append, remove, move } = useFieldArray({
        control: control,
        name: ITEMS_NAME,
    });

    // Watch number of passengers
    const numberOfPassengers = useWatch({
        control,
        name: "details.numberOfPassengers",
    });

    // Watch VAT toggle and template
    const showVat = useWatch({
        control,
        name: "details.showVat",
    });

    const pdfTemplate = useWatch({
        control,
        name: "details.pdfTemplate",
    });

    // Watch column visibility toggles
    const showPassengerName = useWatch({
        control,
        name: "details.showPassengerName",
    });

    const showRoute = useWatch({
        control,
        name: "details.showRoute",
    });

    const showAirlines = useWatch({
        control,
        name: "details.showAirlines",
    });

    const showServiceType = useWatch({
        control,
        name: "details.showServiceType",
    });

    const showAmount = useWatch({
        control,
        name: "details.showAmount",
    });

    // Column names context
    const { columnNames, setColumnNames, saveColumnNames, loading: columnNamesLoading } = useColumnNames();
    const [editingColumnNames, setEditingColumnNames] = useState<typeof columnNames>(columnNames);
    const [isSaving, setIsSaving] = useState(false);
    const [showColumnNameEditor, setShowColumnNameEditor] = useState(false);

    // Sync column names to form data when they load
    useEffect(() => {
        if (!columnNamesLoading) {
            setEditingColumnNames(columnNames);
            // Also sync to form data
            setValue("details.columnNames", columnNames);
        }
    }, [columnNames, columnNamesLoading, setValue]);

    // Ref to track if we're updating to prevent infinite loops
    const isUpdatingRef = useRef(false);
    const lastPassengerCountRef = useRef<number | undefined>(undefined);

    // Generate passenger items based on number of passengers
    useEffect(() => {
        // Skip if already updating or if value hasn't changed
        if (isUpdatingRef.current || lastPassengerCountRef.current === numberOfPassengers) {
            return;
        }

        if (numberOfPassengers && numberOfPassengers > 0) {
            isUpdatingRef.current = true;
            const currentCount = fields.length;
            
            if (numberOfPassengers > currentCount) {
                // Add new passenger items
                const itemsToAdd = numberOfPassengers - currentCount;
                for (let i = 0; i < itemsToAdd; i++) {
                    append({
                        name: "",
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        total: 0,
                        passengerName: "",
                        serviceType: "",
                        vatPercentage: undefined,
                        vat: undefined,
                    });
                }
            } else if (numberOfPassengers < currentCount && currentCount > 0) {
                // Remove excess items (keep at least 1)
                const itemsToRemove = currentCount - numberOfPassengers;
                for (let i = 0; i < itemsToRemove; i++) {
                    const indexToRemove = currentCount - 1 - i;
                    if (indexToRemove >= 0 && indexToRemove < fields.length) {
                        remove(indexToRemove);
                    }
                }
            }
            
            lastPassengerCountRef.current = numberOfPassengers;
            // Reset flag after a short delay to allow state to update
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 100);
        }
    }, [numberOfPassengers, fields.length, append, remove]);

    const addNewField = () => {
        append({
            name: "",
            description: "",
            quantity: 0,
            unitPrice: 0,
            total: 0,
            passengerName: "",
            serviceType: "",
            vatPercentage: undefined,
            vat: undefined,
        });
    };

    const removeField = (index: number) => {
        remove(index);
    };

    const moveFieldUp = (index: number) => {
        if (index > 0) {
            move(index, index - 1);
        }
    };
    const moveFieldDown = (index: number) => {
        if (index < fields.length - 1) {
            move(index, index + 1);
        }
    };

    // DnD
    const [activeId, setActiveId] = useState<UniqueIdentifier>();

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(active.id);

            if (active.id !== over?.id) {
                const oldIndex = fields.findIndex(
                    (item) => item.id === active.id
                );
                const newIndex = fields.findIndex(
                    (item) => item.id === over?.id
                );

                move(oldIndex, newIndex);
            }
        },
        [fields, setValue]
    );

    return (
        <section className="flex flex-col gap-2 w-full">
            <Subheading>{_t("form.steps.lineItems.heading")}:</Subheading>
            
            {/* Number of Passengers Input */}
            <div className="mb-4">
                <FormInput
                    name="details.numberOfPassengers"
                    type="number"
                    label="Number of Passengers"
                    placeholder="Enter number of passengers"
                    className="w-48"
                    vertical
                />
            </div>

            {/* VAT Toggle - Only show for Template 3 */}
            {pdfTemplate === 3 && (
                <div className="mb-4 flex items-center gap-3">
                    <Label htmlFor="showVat">Show VAT in Template</Label>
                    <Switch
                        id="showVat"
                        checked={showVat || false}
                        onCheckedChange={(value) => {
                            setValue("details.showVat", value);
                        }}
                    />
                </div>
            )}

            {/* Column Visibility Toggles */}
            <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="flex justify-between items-center mb-3">
                    <Label className="font-semibold">Column Visibility</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowColumnNameEditor(!showColumnNameEditor)}
                    >
                        {showColumnNameEditor ? "Hide" : "Edit"} Column Names
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showPassengerName"
                            checked={showPassengerName ?? true}
                            onCheckedChange={(value) => {
                                setValue("details.showPassengerName", value);
                            }}
                        />
                        <Label htmlFor="showPassengerName" className="cursor-pointer">{columnNames.passengerName}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showRoute"
                            checked={showRoute ?? true}
                            onCheckedChange={(value) => {
                                setValue("details.showRoute", value);
                            }}
                        />
                        <Label htmlFor="showRoute" className="cursor-pointer">{columnNames.route}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showAirlines"
                            checked={showAirlines ?? true}
                            onCheckedChange={(value) => {
                                setValue("details.showAirlines", value);
                            }}
                        />
                        <Label htmlFor="showAirlines" className="cursor-pointer">{columnNames.airlines}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showServiceType"
                            checked={showServiceType ?? true}
                            onCheckedChange={(value) => {
                                setValue("details.showServiceType", value);
                            }}
                        />
                        <Label htmlFor="showServiceType" className="cursor-pointer">{columnNames.serviceType}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showAmount"
                            checked={showAmount ?? true}
                            onCheckedChange={(value) => {
                                setValue("details.showAmount", value);
                            }}
                        />
                        <Label htmlFor="showAmount" className="cursor-pointer">{columnNames.amount}</Label>
                    </div>
                </div>

                {/* Column Name Editor */}
                {showColumnNameEditor && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                        <Label className="mb-3 block font-semibold">Customize Column Names</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="editPassengerName" className="text-sm">Passenger Name</Label>
                                <Input
                                    id="editPassengerName"
                                    value={editingColumnNames.passengerName}
                                    onChange={(e) => setEditingColumnNames({ ...editingColumnNames, passengerName: e.target.value })}
                                    placeholder="Passenger Name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editRoute" className="text-sm">Route</Label>
                                <Input
                                    id="editRoute"
                                    value={editingColumnNames.route}
                                    onChange={(e) => setEditingColumnNames({ ...editingColumnNames, route: e.target.value })}
                                    placeholder="Route"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editAirlines" className="text-sm">Airlines</Label>
                                <Input
                                    id="editAirlines"
                                    value={editingColumnNames.airlines}
                                    onChange={(e) => setEditingColumnNames({ ...editingColumnNames, airlines: e.target.value })}
                                    placeholder="Airlines"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editServiceType" className="text-sm">Type of Service</Label>
                                <Input
                                    id="editServiceType"
                                    value={editingColumnNames.serviceType}
                                    onChange={(e) => setEditingColumnNames({ ...editingColumnNames, serviceType: e.target.value })}
                                    placeholder="Type of Service"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editAmount" className="text-sm">Amount</Label>
                                <Input
                                    id="editAmount"
                                    value={editingColumnNames.amount}
                                    onChange={(e) => setEditingColumnNames({ ...editingColumnNames, amount: e.target.value })}
                                    placeholder="Amount"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="button"
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        setColumnNames(editingColumnNames);
                                        // Also save to form data
                                        setValue("details.columnNames", editingColumnNames);
                                        await saveColumnNames();
                                        setShowColumnNameEditor(false);
                                    } catch (error) {
                                        console.error("Error saving column names:", error);
                                        alert("Failed to save column names. Please try again.");
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Column Names"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditingColumnNames(columnNames);
                                    setShowColumnNameEditor(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(event) => {
                    const { active } = event;
                    setActiveId(active.id);
                }}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={fields}
                    strategy={verticalListSortingStrategy}
                >
                    {fields.map((field, index) => (
                        <SingleItem
                            key={field.id}
                            name={ITEMS_NAME}
                            index={index}
                            fields={fields}
                            field={field}
                            moveFieldUp={moveFieldUp}
                            moveFieldDown={moveFieldDown}
                            removeField={removeField}
                        />
                    ))}
                </SortableContext>
                {/* <DragOverlay
                    dropAnimation={{
                        duration: 500,
                        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                    }}
                >
                    <div className="w-[10rem]">
                        <p>Click to drop</p>
                    </div>
                </DragOverlay> */}
            </DndContext>
        </section>
    );
};

export default Items;
