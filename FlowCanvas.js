import React, { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import styles from "../styles/FlowCanvas.module.css";
import { useSelector, useDispatch } from 'react-redux';
import { flowSelector, updateNodePositions, createEdgeConnection, flowActions, deleteNodeApiAsync } from '../../../redux/flow.reducer';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import '@xyflow/react/dist/style.css';

// Define node types
const nodeTypes = {
    default: CustomNode,
};

// Define edge types
const edgeTypes = {
    default: CustomEdge,
};

function FlowCanvas() {
    const dispatch = useDispatch();
    const { currentFlow } = useSelector(flowSelector);
    const { nodes, edges, selectedNode, selectedEdge } = currentFlow;

    const { clearSelectedNode, setSelectedNode, setSelectedEdge } = flowActions;

    // Handle node deletion
    const handleDeleteNode = useCallback((nodeId) => {
        const confirmResult = window.confirm("Are you sure you want to delete this node?");
        
        if (confirmResult && selectedNode === nodeId) {
            // Find the complete node object
            const nodeToDelete = nodes.find(node => node._id === nodeId);
            
            if (nodeToDelete) {
                console.log("Node to be deleted:", {
                    _id: nodeToDelete._id,
                    type: nodeToDelete.type,
                    label: nodeToDelete.label,
                    data: nodeToDelete.data,
                    position: nodeToDelete.position
                });

                const deleteBody ={
                    flowId: currentFlow._id,
                    nodeId: nodeToDelete._id,
                    nodeType: nodeToDelete.type.toLowerCase()
                }

                dispatch(deleteNodeApiAsync(deleteBody));

              
            }
        }
    }, [nodes, selectedNode]);

    // Format nodes for React Flow
    const formattedNodes = nodes?.map(node => ({
        id: node._id,
        _id: node._id,
        type: 'default',
        position: node.position,
        selected: node._id === selectedNode,
        data: {
            ...node.data,
            label: node.label,
            nodeType: node.type,
            onDelete: handleDeleteNode,
        }
    })) || [];

    console.log("current flow in FlowCanvas: ", currentFlow)

    // Format edges for React Flow
    const formattedEdges = edges?.map(edge => ({
        id: edge._id,
        source: edge.source,
        target: edge.target,
    })) || [];

    // Use React Flow's built-in state management
    const [flowNodes, setNodes, onNodesChange] = useNodesState(formattedNodes);
    const [flowEdges, setEdges, onEdgesChange] = useEdgesState(formattedEdges);

    // Handle node position updates when dragging ends
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);

        const positionChange = changes.find(change => 
            change.type === 'position' && change.dragging === false
        );

        if (positionChange) {
            dispatch(updateNodePositions({
                flowId: currentFlow._id,
                nodeId: positionChange.id,
                position: positionChange.position
            }));
        }
    }, [currentFlow._id, dispatch, onNodesChange]);

    // Handle edge connections
    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge(params, eds));

        dispatch(createEdgeConnection({
            flowId: currentFlow._id,
            source: params.source,
            target: params.target
        }));
    }, [currentFlow._id, dispatch, setEdges]);

    // Update local state when Redux state changes
    React.useEffect(() => {
        setNodes(formattedNodes);
        setEdges(formattedEdges);
    }, [nodes, edges, setNodes, setEdges, selectedNode]);

    //======== handle selectedNode ===============//
    function handleNodeClick(event, node) {
        event.stopPropagation();  // Stop event from bubbling up to panel
        dispatch(setSelectedNode(node._id));
    }

    //======== handle pane click to deselect node ===============//
    function handlePaneClick(event) {
        event.stopPropagation(); 
        dispatch(clearSelectedNode());
    }

    // ======== handle edges click ============//
    function handleEdgeClick(event, edge) {
        event.stopPropagation();  

        console.log("edges clicked: ", edge)
        dispatch(setSelectedEdge(edge));

    }

    console.log("selected edges in flow canvas: ", selectedEdge)

    

    return (
        <div className={styles.flowContainer}>
            <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                onNodesChange={handleNodesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                onEdgeClick={handleEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default FlowCanvas;
