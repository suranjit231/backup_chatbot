import React, { useState, useEffect } from 'react';
import styles from '../questionCs/Question.module.css';
import QuestionForm from './QuestionForm';
import { flowSelector } from '../../../redux/flow.reducer';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuestionTextApi,
     createQuestionNodeOtionsFields, updateQuestionNodeOtionsFieldsApi } from '../../../redux/question.reducer';

const defaultQuestionData = {
    type: 'question',
    label: 'Question Node',
    question: {
        text: '',
        options: [],
        label: ''
    },
    routing: {
        inputMappings: {},
        routingMap: {},
        default: null
    }
};

const Question = ({ data = defaultQuestionData, onUpdate, onDelete }) => {
    const [questionData, setQuestionData] = useState(defaultQuestionData);
    const dispatch = useDispatch();

    // ========== REDUX STATE FLOW GLOBAL STATE=========== //
    const { currentFlow } = useSelector(flowSelector);
    const { currentSelectedNode } = currentFlow;

    useEffect(() => {
        // Initialize from selected node or prop data
        const nodeData = currentSelectedNode || data;
        if (nodeData) {
            setQuestionData({
                type: nodeData.type || 'question',
                label: nodeData.label || 'Question Node',
                question: {
                    text: nodeData.question?.text || '',
                    options: nodeData.question?.options || [],
                    label: nodeData.question?.label || ''
                },
                routing: {
                    inputMappings: nodeData.routing?.inputMappings || {},
                    routingMap: nodeData.routing?.routingMap || {},
                    default: nodeData.routing?.default || null
                }
            });
        }
    }, [currentSelectedNode, data]);

    const handleQuestionTextChange = (text) => {
        setQuestionData(prev => ({
            ...prev,
            question: {
                ...prev.question,
                text
            }
        }));
    };


    // ========== function to update question text ===========//
    const handleQuestionUpdate = (updatedQuestion) => {
        if (currentFlow?._id && currentSelectedNode?._id) {
            dispatch(updateQuestionTextApi({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                updateText: updatedQuestion.text
            }));
        }
    };


    // ========== function to create question node options fields ===========//
    const handleCreateOptionsFields = () => {
        if (currentFlow?._id && currentSelectedNode?._id) {
            dispatch(createQuestionNodeOtionsFields({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id
            }));
        }
    };



    // ========== function handle update question node options fields ===========//
    const handleUpdateOptionsFields = (optionId, updateData) => {
        if (currentFlow?._id && currentSelectedNode?._id) {
            dispatch(updateQuestionNodeOtionsFieldsApi({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                optionId,
                updateData
            }));
        }
    };

    return (
        <div className={styles.questionNode}>
            <div className={styles.header}>
                <h3>Question Node</h3>
                {onDelete && (
                    <button onClick={onDelete} className={styles.deleteButton}>
                        Delete
                    </button>
                )}
            </div>

            <div className={styles.content}>
                <QuestionForm
                    question={currentSelectedNode?.question || defaultQuestionData.question}
                    routing={currentSelectedNode?.routing || defaultQuestionData.routing}
                    onQuestionChange={handleQuestionUpdate}
                    onUpdateOption={handleUpdateOptionsFields}
                />
                <div className={styles.divider} />
            </div>

            {/* ========== add options button =========== */}
            <div className={styles.questionFooterDiv}>
                <div onClick={()=>handleCreateOptionsFields()}
                 className={styles.addOptionsButtonDiv}>
                    Add Options
                </div>

                <div className={styles.defaultRoutingDiv}>
                    <label>Default Routing:</label>
                    <p className={styles.defaultRoutingTag}>Select default Next</p>
                </div>
            </div>
        </div>
    );
};

export default Question;
