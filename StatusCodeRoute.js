import { useState } from "react";
import styles from "../apiCs/StatusCoderoute.module.css"
import { IoClose } from "react-icons/io5";
import NextStepModalList from "../../../utility/nextStepsModel/NextStepModel"
import { FaGoogleDrive } from "react-icons/fa";

export default function StatusCodeRouteModel({ onClose, onSave, currentNode }) {
    const [statusCode, setStatusCode] = useState("");
    const [selectedGotoNode, setSelectedGotoNode] = useState(null);
    const [isShowNextStepModal, setIsShowNextStepModal] = useState(false);

    function getNodeAndSetSelected(nodeData) {
        // nodeData will have: { nodeId, isNew, nodeType }
        setSelectedGotoNode({
            id: nodeData.nodeId,
            type: nodeData.nodeType,
            label: `${nodeData.nodeType} Node`
        });
        setIsShowNextStepModal(false);
    }

    function handleClickSelectNextStep() {
        setIsShowNextStepModal(true);
    }

    function handleClickDeleteGotoNode() {
        setSelectedGotoNode(null);
    }

    function handleSave() {
        if (!statusCode || !selectedGotoNode) return;
        onSave(statusCode, selectedGotoNode);
        onClose();
    }

    return (
        <>
            <div className={styles.responseRouteModalWrapper}>
                <div className={styles.apiResponseModalContainer}>
                    <IoClose onClick={onClose} className={styles.closedModalIcon} />

                    <h3>Add Route</h3>

                    <div className={styles.responseModalBox}>
                        <div className={styles.responseStatusCodeBox}>
                            <p>If response code starts with</p>
                            <input 
                                type="text"
                                value={statusCode}
                                onChange={(e) => setStatusCode(e.target.value)}
                                placeholder="Enter response code" 
                            />
                        </div>

                        <div className={styles.responseStatusGotoBox}>
                            <p>Goto Step</p>

                            {selectedGotoNode ? (
                                <div className={styles.selectedGotoBox}>
                                    <div className={styles.gotoIcon}>
                                        <FaGoogleDrive />
                                    </div>

                                    <p>{selectedGotoNode.label}</p>

                                    <div className={styles.deleteGotoBtnBox}>
                                        <IoClose 
                                            onClick={handleClickDeleteGotoNode}
                                            className={styles.deleteGotoButton} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={handleClickSelectNextStep}
                                    className={styles.gotoButton}
                                >
                                    Select Next Step
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.responseStatusCodeButtonDiv}>
                        <button 
                            onClick={onClose}
                            className={styles.cancelAddResponseModalButton}
                        >
                            Cancel
                        </button>
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>
            </div>

            {isShowNextStepModal && (
                <NextStepModalList
                    onSelect={getNodeAndSetSelected}
                    onClose={() => setIsShowNextStepModal(false)}
                    position={{
                        x: currentNode?.position?.x || 0,
                        y: currentNode?.position?.y || 0
                    }}
                />
            )}
        </>
    );
}
