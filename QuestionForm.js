import React from 'react';
import styles from '../questionCs/Question.module.css';
import { IoClose } from "react-icons/io5";

const defaultQuestion = {
    text: '',
    options: []
};

const defaultRouting = {
    routingMap: {},
    default: null
};

const QuestionForm = ({ 
    question = defaultQuestion,
    routing = defaultRouting,
    onQuestionTextChange,
    onOptionsChange,
    onRoutingMapChange,
    onDefaultRouteChange,
    onQuestionUpdate,
    onUpdateOption
}) => {
    const handleQuestionTextChange = (e) => {
        onQuestionTextChange?.(e.target.value);
    };

    const handleQuestionTextBlur = (e) => {
        onQuestionUpdate?.({
            ...question,
            text: e.target.value
        });
    };

    const handleOptionChange = (index, field, value) => {
        const option = question.options[index];
        const updateData = {
            ...option,
            [field]: value
        };

        // If updating synonyms, convert string to array
        if (field === 'synonyms') {
            updateData.synonyms = value.split(',').map(s => s.trim()).filter(Boolean);
        }

        onUpdateOption?.(option._id, updateData);
    };

    return (
        <div className={styles.questionForm}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Question Text</label>
                <input
                    type="text"
                    value={question.text || ''}
                    onChange={handleQuestionTextChange}
                    onBlur={handleQuestionTextBlur}
                    className={styles.input}
                    placeholder="Enter your question"
                />
            </div>

            <div className={styles.optionsListSection}>
                {question.options?.map((option, index) => (
                    <div key={index} className={styles.optionsSection}>
                        <IoClose className={styles.optionsDeleteIcon} />
                        <input 
                            type="text" 
                            className={styles.displayName} 
                            placeholder='Display Name...'
                            value={option.label || ''}
                            onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        />

                        <input 
                            type="text" 
                            className={styles.valueOption} 
                            placeholder='Value...'
                            value={option.value || ''}
                            onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                        />

                        <textarea 
                            className={styles.synomousInput} 
                            placeholder="Enter synonyms separated by commas" 
                            rows={3}
                            value={option.synonyms?.join(', ') || ''}
                            onChange={(e) => handleOptionChange(index, 'synonyms', e.target.value)}
                        />

                        <div className={styles.routeButtonDiv}>
                            {routing.routingMap?.[option.value] || 'Select Next Route'}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default QuestionForm;
