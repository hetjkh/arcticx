"use client";

import { useEffect } from "react";

// RHF
import { FieldArrayWithId, useFormContext, useWatch } from "react-hook-form";

// DnD
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ShadCn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Components
import { BaseButton, FormInput, FormTextarea } from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";

// Types
import { ItemType, NameType } from "@/types";

type SingleItemProps = {
    name: NameType;
    index: number;
    fields: ItemType[];
    field: FieldArrayWithId<ItemType>;
    moveFieldUp: (index: number) => void;
    moveFieldDown: (index: number) => void;
    removeField: (index: number) => void;
};

const SingleItem = ({
    name,
    index,
    fields,
    field,
    moveFieldUp,
    moveFieldDown,
    removeField,
}: SingleItemProps) => {
    const { control, setValue } = useFormContext();

    const { _t } = useTranslationContext();

    // Items
    const rate = useWatch({
        name: `${name}[${index}].unitPrice`,
        control,
    });

    const quantity = useWatch({
        name: `${name}[${index}].quantity`,
        control,
    });

    const total = useWatch({
        name: `${name}[${index}].total`,
        control,
    });

    const vatPercentage = useWatch({
        name: `${name}[${index}].vatPercentage`,
        control,
    });

    const vat = useWatch({
        name: `${name}[${index}].vat`,
        control,
    });

    const extraDeliverableEnabled = useWatch({
        name: `${name}[${index}].extraDeliverableEnabled`,
        control,
    });

    const extraDeliverableAmount = useWatch({
        name: `${name}[${index}].extraDeliverableAmount`,
        control,
    });

    const extraDeliverableVatPercentage = useWatch({
        name: `${name}[${index}].extraDeliverableVatPercentage`,
        control,
    });

    const extraDeliverableVat = useWatch({
        name: `${name}[${index}].extraDeliverableVat`,
        control,
    });

    const extraDeliverableShowVat = useWatch({
        name: `${name}[${index}].extraDeliverableShowVat`,
        control,
    });

    // Currency
    const currency = useWatch({
        name: `details.currency`,
        control,
    });

    // Template
    const pdfTemplate = useWatch({
        name: `details.pdfTemplate`,
        control,
    });

    // Calculate VAT amount automatically from VAT percentage ONLY
    // Example: if you enter 5 (%) then VAT amount becomes 50
    useEffect(() => {
        if (vatPercentage != undefined && vatPercentage !== "") {
            const vatPercentValue = Number(vatPercentage) || 0;

            if (vatPercentValue >= 0) {
                // Custom rule: VAT amount is 10x the VAT percentage (5% -> 50)
                const calculatedVatAmount = (vatPercentValue * 10).toFixed(2);
                setValue(`${name}[${index}].vat`, calculatedVatAmount);
            } else {
                setValue(`${name}[${index}].vat`, "0");
            }
        } else {
            // If VAT percentage is cleared, reset VAT amount
            setValue(`${name}[${index}].vat`, "0");
        }
    }, [vatPercentage, setValue, name, index]);

    // Calculate extra deliverable VAT amount automatically from VAT percentage ONLY
    // Example: if you enter 5 (%) then VAT amount becomes 50
    useEffect(() => {
        if (extraDeliverableVatPercentage != undefined && extraDeliverableVatPercentage !== "") {
            const vatPercentValue = Number(extraDeliverableVatPercentage) || 0;

            if (vatPercentValue >= 0) {
                // Custom rule: VAT amount is 10x the VAT percentage (5% -> 50)
                const calculatedVatAmount = (vatPercentValue * 10).toFixed(2);
                setValue(`${name}[${index}].extraDeliverableVat`, calculatedVatAmount);
            } else {
                setValue(`${name}[${index}].extraDeliverableVat`, "0");
            }
        } else {
            // If VAT percentage is cleared, reset VAT amount
            setValue(`${name}[${index}].extraDeliverableVat`, "0");
        }
    }, [extraDeliverableVatPercentage, setValue, name, index]);

    useEffect(() => {
        // Calculate total when rate, VAT, or extra deliverable amount changes (quantity is always 1 for passengers)
        // Total = rate + VAT amount + extra deliverable amount + extra deliverable VAT (if enabled)
        if (rate != undefined) {
            const rateValue = Number(rate) || 0;
            const vatValue = Number(vat) || 0;
            const extraAmount = (extraDeliverableEnabled && extraDeliverableAmount) 
                ? Number(extraDeliverableAmount) || 0 
                : 0;
            const extraVatValue = (extraDeliverableEnabled && extraDeliverableVat) 
                ? Number(extraDeliverableVat) || 0 
                : 0;
            const calculatedTotal = (rateValue + vatValue + extraAmount + extraVatValue).toFixed(2);
            setValue(`${name}[${index}].total`, calculatedTotal);
            setValue(`${name}[${index}].quantity`, 1);
        }
    }, [rate, vat, extraDeliverableEnabled, extraDeliverableAmount, extraDeliverableVat, setValue, name, index]);

    // DnD
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const boxDragClasses = isDragging
        ? "border-2 bg-gray-200 border-blue-600 dark:bg-slate-900 z-10"
        : "border";

    const gripDragClasses = isDragging
        ? "opacity-0 group-hover:opacity-100 transition-opacity cursor-grabbing"
        : "cursor-grab";

    return (
        <div
            style={style}
            {...attributes}
            className={`${boxDragClasses} group flex flex-col gap-y-5 p-3 my-2 cursor-default rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-gray-600`}
        >
            {/* {isDragging && <div className="bg-blue-600 h-1 rounded-full"></div>} */}
            <div className="flex flex-wrap justify-between">
                <p className="font-medium">
                    Person {index + 1}
                </p>

                <div className="flex gap-3">
                    {/* Drag and Drop Button */}
                    <div
                        className={`${gripDragClasses} flex justify-center items-center`}
                        ref={setNodeRef}
                        {...listeners}
                    >
                        <GripVertical className="hover:text-blue-600" />
                    </div>

                    {/* Up Button */}
                    <BaseButton
                        size={"icon"}
                        tooltipLabel="Move the item up"
                        onClick={() => moveFieldUp(index)}
                        disabled={index === 0}
                    >
                        <ChevronUp />
                    </BaseButton>

                    {/* Down Button */}
                    <BaseButton
                        size={"icon"}
                        tooltipLabel="Move the item down"
                        onClick={() => moveFieldDown(index)}
                        disabled={index === fields.length - 1}
                    >
                        <ChevronDown />
                    </BaseButton>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between gap-y-5 gap-x-2">
                    <FormInput
                        name={`${name}[${index}].passengerName`}
                        label={`Passenger Name (Person ${index + 1})`}
                        placeholder={`Enter passenger ${index + 1} name`}
                        vertical
                    />

                    <FormInput
                        name={`${name}[${index}].name`}
                        label="Airlines"
                        placeholder="Enter airline name"
                        vertical
                    />

                    <FormInput
                        name={`${name}[${index}].serviceType`}
                        label="Type of Service"
                        placeholder="Enter type of service"
                        className="w-[12rem]"
                        vertical
                    />

                    <FormInput
                        name={`${name}[${index}].unitPrice`}
                        type="number"
                        label="Rate"
                        labelHelper={`(${currency})`}
                        placeholder="Enter rate"
                        className="w-[8rem]"
                        vertical
                    />

                    <FormInput
                        name={`${name}[${index}].vatPercentage`}
                        type="number"
                        label="VAT %"
                        labelHelper="(%)"
                        placeholder="Enter VAT %"
                        className="w-[8rem]"
                        vertical
                    />

                    <FormInput
                        name={`${name}[${index}].vat`}
                        type="number"
                        label="VAT Amount"
                        labelHelper={`(${currency})`}
                        placeholder="Auto-calculated"
                        className="w-[8rem]"
                        vertical
                        readOnly
                    />

                    <div className="flex flex-col gap-2">
                        <div>
                            <Label>Total</Label>
                        </div>
                        <Input
                            value={`${total} ${currency}`}
                            readOnly
                            placeholder="Item total"
                            className="border-none font-medium text-lg bg-transparent"
                            size={10}
                        />
                    </div>
                </div>
                
                <FormTextarea
                    name={`${name}[${index}].description`}
                    label="Description"
                    placeholder="Enter description"
                />

                {/* Extra Deliverable Section */}
                <div className="space-y-3 border-t pt-4 mt-4">
                    <div className="flex items-center gap-3">
                        <Label htmlFor={`extraDeliverableEnabled-${index}`}>
                            Enable Extra Deliverable Row
                        </Label>
                        <Switch
                            id={`extraDeliverableEnabled-${index}`}
                            checked={extraDeliverableEnabled || false}
                            onCheckedChange={(value) => {
                                setValue(`${name}[${index}].extraDeliverableEnabled`, value);
                            }}
                        />
                    </div>

                    {extraDeliverableEnabled && (
                        <>
                        <div className="flex items-center gap-3">
                            <Label htmlFor={`extraDeliverableShowVat-${index}`}>
                                Show VAT in Template
                            </Label>
                            <Switch
                                id={`extraDeliverableShowVat-${index}`}
                                checked={extraDeliverableShowVat || false}
                                onCheckedChange={(value) => {
                                    setValue(`${name}[${index}].extraDeliverableShowVat`, value);
                                }}
                            />
                        </div>
                        <div className="flex flex-wrap justify-between gap-y-5 gap-x-2">
                            <FormInput
                                name={`${name}[${index}].extraDeliverable`}
                                label="Extra Deliverable"
                                placeholder="Enter extra deliverable details"
                                className="flex-1 min-w-[200px]"
                                vertical
                            />

                            <FormInput
                                name={`${name}[${index}].extraDeliverableServiceType`}
                                label="Type of Service"
                                placeholder="Enter service type"
                                className="w-[8rem]"
                                vertical
                            />

                            <FormInput
                                name={`${name}[${index}].extraDeliverableAmount`}
                                type="number"
                                label="Extra Deliverable Amount"
                                labelHelper={`(${currency})`}
                                placeholder="Enter amount"
                                className="w-[8rem]"
                                vertical
                            />

                            <FormInput
                                name={`${name}[${index}].extraDeliverableVatPercentage`}
                                type="number"
                                label="VAT %"
                                labelHelper="(%)"
                                placeholder="Enter VAT %"
                                className="w-[8rem]"
                                vertical
                            />

                            <FormInput
                                name={`${name}[${index}].extraDeliverableVat`}
                                type="number"
                                label="VAT Amount"
                                labelHelper={`(${currency})`}
                                placeholder="Auto-calculated"
                                className="w-[8rem]"
                                vertical
                                readOnly
                            />
                        </div>
                        </>
                    )}
                </div>
            </div>
            <div>
                {/* Not allowing deletion for first item when there is only 1 item */}
                {fields.length > 1 && (
                    <BaseButton
                        variant="destructive"
                        onClick={() => removeField(index)}
                    >
                        <Trash2 />
                        {_t("form.steps.lineItems.removeItem")}
                    </BaseButton>
                )}
            </div>
        </div>
    );
};

export default SingleItem;
