import { IoMenu } from "react-icons/io5";
import styles from "../apiCs/ApiNode.module.css";
import { FaExternalLinkAlt } from "react-icons/fa";
import { flowSelector } from "../../../redux/flow.reducer";
import { addResponseStatusApi } from "../../../redux/api.reducer";
import { useSelector, useDispatch } from "react-redux";
import StatusCodeRouteModel from "./StatusCodeRoute";
import { useState } from "react";

export default function ApiNode() {
    const { currentFlow } = useSelector(flowSelector);
    const { currentSelectedNode } = currentFlow;
    const [showStatusCodeModal, setShowStatusCodeModal] = useState(false);
    const dispatch = useDispatch();

    const handleAddRoute = () => {
        setShowStatusCodeModal(true);
    };

    const handleStatusCodeSave = (statusCode, nextNode) => {
        dispatch(addResponseStatusApi({
            flowId: currentFlow._id,
            nodeId: currentSelectedNode._id,
            updates: {
                status: parseInt(statusCode),
                next: nextNode.id
            }
        }));
        
        setShowStatusCodeModal(false);
    };

    return (
        <>
            <div className={styles.ApiCallMainContainer}>
                <div className={styles.apiCallNodeTitleDiv}>
                    <div className={styles.titleIcon}>&#9735;</div>
                    <input
                        type="text"
                        placeholder="Custom tag..."
                        value={currentSelectedNode?.label}
                        onChange={(e) => {}}
                        className={styles.labelInput}
                    />
                    <div className={styles.toggleMenuIcon}>
                        <IoMenu />
                    </div>
                </div>

                <div className={styles.apiResponseWithMappedVariableDisplayBox}>
                    <p>Response taken from API and mapped to variables as shown below:</p>
                    {currentSelectedNode?.responseMapPathList && currentSelectedNode?.responseMapPathList?.map((mapPath, idx) => (
                        <div key={idx}>
                            <p>Path: {mapPath.jsonPath} → Variable: {mapPath.value} {mapPath.fallback && `(Fallback: ${mapPath.fallback})`}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.apiReqResponseBox}>
                    <div className={styles.boxTitle}>
                        <FaExternalLinkAlt className={styles.linkIcon} />
                        <p>External Request</p>
                    </div>

                    <div onClick={() => {}} className={styles.apiRequestUrl}>
                        <p>show req url</p>
                    </div>

                    <div className={styles.responseStatusCodeButtonDiv}>

                        
                            { currentSelectedNode?.responseStatus && currentSelectedNode?.responseStatus?.length > 0 && currentSelectedNode?.responseStatus?.map((status, idx) => (

                            <p className={styles.responseStatusCode} key={idx}>
                                {status.status}
                            </p>
                                
                         ))}
                                
                      
                    </div>

                    <div onClick={handleAddRoute} className={styles.addResponseRoutesButton}>
                        + Add Route
                    </div>
                </div>

                {/* ========== next steps button after performing this api call===== */}
                <div className={styles.nextStepsButtonAfterApiCall}>
                    <p>Next step after actions are performed</p>

                    <div className={styles.nextStepsButton}>
                        Select Next Step
                    </div>
                </div>
            </div>

            {showStatusCodeModal && (
                <StatusCodeRouteModel
                    onClose={() => setShowStatusCodeModal(false)}
                    onSave={handleStatusCodeSave}
                    currentNode={currentSelectedNode}
                />
            )}
        </>
    );
}
