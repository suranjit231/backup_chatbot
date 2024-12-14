import React, { useState, useEffect, useCallback } from "react";
import styles from "../inputCs/Input.module.css";

import { useSelector, useDispatch } from "react-redux";
import { flowSelector } from "../../../redux/flow.reducer";
import { updateInputNode } from "../../../redux/input.reducer";

export default function Input() {
    const dispatch = useDispatch();
    
    const { currentFlow } = useSelector(flowSelector);
    const { currentSelectedNode } = currentFlow;

    // Local state for form values
    const [formData, setFormData] = useState({
        label: "",
        text: "",
        validation: {
            type: "string",
            required: false,
            pattern: "",
            minLength: "",
            maxLength: "",
            min: "",
            max: ""
        },
        successMessage: ""
    });

    // Update local state when node changes
    useEffect(() => {
        if (currentSelectedNode) {
            setFormData({
                label: currentSelectedNode.label || "",
                text: currentSelectedNode.data?.text || "",
                validation: {
                    type: currentSelectedNode.data?.validation?.type || "string",
                    required: currentSelectedNode.data?.validation?.required || false,
                    pattern: currentSelectedNode.data?.validation?.pattern || "",
                    minLength: currentSelectedNode.data?.validation?.minLength || "",
                    maxLength: currentSelectedNode.data?.validation?.maxLength || "",
                    min: currentSelectedNode.data?.validation?.min || "",
                    max: currentSelectedNode.data?.validation?.max || ""
                },
                successMessage: currentSelectedNode.data?.successMessage || ""
            });
        }
    }, [currentSelectedNode]);

    const saveChanges = useCallback(async (updates) => {
        if (currentSelectedNode) {
            try {
                dispatch(updateInputNode({
                    flowId: currentFlow._id,
                    nodeId: currentSelectedNode._id,
                    updates
                }));
            } catch (error) {
                console.error('Failed to save changes:', error);
            }
        }
    }, [currentSelectedNode, currentFlow._id, dispatch]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            if (field === "label") {
                return { ...prev, label: value };
            } else if (field.includes(".")) {
                const [parent, child] = field.split(".");
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            } else {
                return { ...prev, [field]: value };
            }
        });
    };

    const handleBlur = (field) => {
        if (!currentSelectedNode) return;

        if (field === "label" && formData.label !== currentSelectedNode.label) {
            saveChanges({ label: formData.label });
        } else if (field === "text" && formData.text !== currentSelectedNode.data?.text) {
            saveChanges({
                data: { text: formData.text }
            });
        } else if (field === "successMessage" && formData.successMessage !== currentSelectedNode.data?.successMessage) {
            saveChanges({
                data: { successMessage: formData.successMessage }
            });
        } else if (field.startsWith("validation.")) {
            const currentValidation = currentSelectedNode.data?.validation || {};
            const [, validationField] = field.split(".");
            if (formData.validation[validationField] !== currentValidation[validationField]) {
                saveChanges({
                    data: {
                        validation: {
                            ...currentValidation,
                            [validationField]: formData.validation[validationField]
                        }
                    }
                });
            }
        }
    };

    const validationTypes = ["string", "number", "email", "date"];

    return (
        <div className={styles.inputNodeContainer}>
            <div className={styles.header}>
                <span className={styles.icon}>📝</span>
                <h4 className={styles.title}>Input Node</h4>
            </div>
            
            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Node Label</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.label}
                        onChange={(e) => handleChange("label", e.target.value)}
                        onBlur={() => handleBlur("label")}
                        placeholder="Enter a label for this node..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Question Text</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.text}
                        onChange={(e) => handleChange("text", e.target.value)}
                        onBlur={() => handleBlur("text")}
                        placeholder="Enter the question for the user..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Input Type</label>
                    <select
                        className={styles.select}
                        value={formData.validation.type}
                        onChange={(e) => handleChange("validation.type", e.target.value)}
                        onBlur={() => handleBlur("validation.type")}
                    >
                        {validationTypes.map(type => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.validationGroup}>
                    <div className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.validation.required}
                            onChange={(e) => {
                                handleChange("validation.required", e.target.checked);
                                handleBlur("validation.required");
                            }}
                        />
                        <label className={styles.label}>Required Field</label>
                    </div>

                    {(formData.validation.type === "string" || formData.validation.type === "email") && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Pattern (Regex)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.validation.pattern}
                                    onChange={(e) => handleChange("validation.pattern", e.target.value)}
                                    onBlur={() => handleBlur("validation.pattern")}
                                    placeholder={formData.validation.type === "email" ? 
                                        "e.g., ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" : 
                                        "e.g., ^[0-9]{10}$"}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Min Length</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.validation.minLength}
                                    onChange={(e) => handleChange("validation.minLength", parseInt(e.target.value))}
                                    onBlur={() => handleBlur("validation.minLength")}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Max Length</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.validation.maxLength}
                                    onChange={(e) => handleChange("validation.maxLength", parseInt(e.target.value))}
                                    onBlur={() => handleBlur("validation.maxLength")}
                                />
                            </div>
                        </>
                    )}

                    {formData.validation.type === "number" && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Minimum Value</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.validation.min}
                                    onChange={(e) => handleChange("validation.min", parseInt(e.target.value))}
                                    onBlur={() => handleBlur("validation.min")}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Maximum Value</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.validation.max}
                                    onChange={(e) => handleChange("validation.max", parseInt(e.target.value))}
                                    onBlur={() => handleBlur("validation.max")}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Success Message</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.successMessage}
                        onChange={(e) => handleChange("successMessage", e.target.value)}
                        onBlur={() => handleBlur("successMessage")}
                        placeholder="Message to show after successful input..."
                    />
                </div>

                <div className={styles.routingSection}>
                    <div className={styles.routingHeader}>
                        <span className={styles.routingIcon}>🔀</span>
                        <span>Routing</span>
                    </div>
                    <div className={styles.routingInfo}>
                        {currentSelectedNode?.routing?.next ? (
                            <>
                                <span className={styles.routingValue}>
                                    Next: {currentSelectedNode.routing.next}
                                </span>
                            </>
                        ) : (
                            <span className={styles.routingValue}>No next node selected</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
