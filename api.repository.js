import ApiNode from "./api.schema.js";
import flowModel from "../flow/flowSchema.js";
import { AppError } from "../../middleware/errorHandler.middleware.js";
import { NODE_TYPES } from "../flow/flowSchema.js";
import FlowRepository from "../flow/flow.repository.js";

export default class ApiRepository {

    constructor() {
        this.flowRepository = new FlowRepository();
    }

    // =========== create new api node ===========//
    async createApiNode(flowId, position) {
        try {
            // Position is required for UI placement
            if (!position || !position.x || !position.y) {
                throw new AppError("Position with x and y coordinates is required", 400);
            }

            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Create structured node data based on schema
            const nodeData = {
                position,
                name: '',  // Optional as per schema
                description: '',
                reqUrl: '',  // Optional as per schema
                methods: 'get',  // Default to GET, enum: ['get', 'post', 'put', 'delete', 'patch']
                matchedPathVariableList: [],  // Array of PathVariableSchema
                responseMapPathList: [],      // Array of ResponseMapPathSchema
                responseStatus: [],           // Array of ResponseStatusSchema
                urlParams: [],               // Array of PathVariableSchema
                headers: [],                 // Array of HeaderSchema
                authorization: {             // AuthorizationSchema
                    authType: 'none',
                    credential: {}
                },
                body: {                     // BodySchema
                    type: 'none',
                    bodyData: []
                },
                testBodyData: []            // Array of mixed types
            };

            // Create the API node
            const apiNode = new ApiNode(nodeData);

            // Save the API node
            const savedApiNode = await apiNode.save();

            // Add the node reference to the flow
            flow.nodes.push({
                type: NODE_TYPES.API,
                ref: savedApiNode._id,
                refModel: 'ApiNode'
            });

            // Save the updated flow
            await flow.save();

            return {
                success: true,
                message: "API node created successfully",
                data: savedApiNode
            };

        } catch (error) {
            console.error("Error creating API node:", error);
            throw error;
        }
    }

    // =========== update api node ===========//
    async updateApiNode(flowId, nodeId, updateData) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Check if node exists in flow
            const nodeExists = flow.nodes.some(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'ApiNode'
            );
            if (!nodeExists) {
                throw new AppError("API node not found in flow", 404);
            }

            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            // Update label if provided
            if (updateData.label) {
                apiNode.label = updateData.label;
            }

            // Update position if provided
            if (updateData.position) {
                apiNode.position = updateData.position;
            }

            // Update other fields if provided
            if (updateData.name) apiNode.name = updateData.name;
            if (updateData.description) apiNode.description = updateData.description;
            if (updateData.reqUrl) apiNode.reqUrl = updateData.reqUrl;
            if (updateData.methods) apiNode.methods = updateData.methods;

            // Update node fields
            Object.assign(apiNode, updateData);

            // Save the updated node
            const updatedNode = await apiNode.save();

            // Update edges if response status changes
            if (updateData.responseStatus) {
                // Remove existing edges from this node
                flow.edges = flow.edges.filter(edge => edge.source.toString() !== nodeId);

                // Add new edges based on updated response status
                updateData.responseStatus.forEach(status => {
                    if (status.next) {
                        flow.edges.push({
                            source: nodeId,
                            target: status.next
                        });
                    }
                });

                await flow.save();
            }

            return {
                success: true,
                message: "API node updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== delete api node ===========//
    async deleteApiNode(flowId, nodeId) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Remove node reference from flow
            flow.nodes = flow.nodes.filter(node => 
                !(node.ref.toString() === nodeId && node.refModel === 'ApiNode')
            );

            // Remove all edges connected to this node
            flow.edges = flow.edges.filter(edge => 
                edge.source.toString() !== nodeId && 
                edge.target.toString() !== nodeId
            );

            // Save the updated flow
           const updatedFlow = await flow.save();

            // Delete the API node
            const deletedNode = await ApiNode.findByIdAndDelete(nodeId);
            if (!deletedNode) {
                throw new AppError("API node not found", 404);
            }

            return {
                success: true,
                message: "API node deleted successfully",
                data:{
                    flow:updatedFlow,
                    node:deletedNode
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== get api node ===========//
    async getApiNode(flowId, nodeId) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Check if node exists in flow
            const nodeExists = flow.nodes.some(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'ApiNode'
            );
            if (!nodeExists) {
                throw new AppError("API node not found in flow", 404);
            }

            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            return {
                success: true,
                data: apiNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update response status ===========//
    async updateResponseStatus(flowId, nodeId, statusData) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            // Update response status
            apiNode.responseStatus = statusData;

            // Save the updated node
            const updatedNode = await apiNode.save();

            // Update flow edges
            const flow = await flowModel.findById(flowId);
            if (flow) {
                // Remove existing edges from this node
                flow.edges = flow.edges.filter(edge => edge.source.toString() !== nodeId);

                // Add new edges based on updated response status
                statusData.forEach(status => {
                    if (status.next) {
                        flow.edges.push({
                            source: nodeId,
                            target: status.next
                        });
                    }
                });

                await flow.save();
            }

            return {
                success: true,
                message: "Response status updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== add path variable ===========//
    async addPathVariable(nodeId, pathVariable) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.matchedPathVariableList.push(pathVariable);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Path variable added successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update path variable ===========//
    async updatePathVariable(nodeId, variableIndex, updatedVariable) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            if (variableIndex >= apiNode.matchedPathVariableList.length) {
                throw new AppError("Path variable index out of bounds", 400);
            }

            apiNode.matchedPathVariableList[variableIndex] = updatedVariable;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Path variable updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== remove path variable ===========//
    async removePathVariable(nodeId, variableIndex) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.matchedPathVariableList.splice(variableIndex, 1);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Path variable removed successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== add header ===========//
    async addHeader(nodeId, header) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.headers.push(header);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Header added successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update header ===========//
    async updateHeader(nodeId, headerIndex, updatedHeader) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            if (headerIndex >= apiNode.headers.length) {
                throw new AppError("Header index out of bounds", 400);
            }

            apiNode.headers[headerIndex] = updatedHeader;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Header updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== remove header ===========//
    async removeHeader(nodeId, headerIndex) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.headers.splice(headerIndex, 1);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Header removed successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update authorization ===========//
    async updateAuthorization(nodeId, authData) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.authorization = authData;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Authorization updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update request body ===========//
    async updateRequestBody(nodeId, bodyData) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.body = bodyData;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Request body updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== add body data ===========//
    async addBodyData(nodeId, data) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.body.bodyData.push(data);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Body data added successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update body data ===========//
    async updateBodyData(nodeId, dataIndex, updatedData) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            if (dataIndex >= apiNode.body.bodyData.length) {
                throw new AppError("Body data index out of bounds", 400);
            }

            apiNode.body.bodyData[dataIndex] = updatedData;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Body data updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== remove body data ===========//
    async removeBodyData(nodeId, dataIndex) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.body.bodyData.splice(dataIndex, 1);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Body data removed successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== add response map path ===========//
    async addResponseMapPath(nodeId, mapPath) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.responseMapPathList.push(mapPath);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Response map path added successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update response map path ===========//
    async updateResponseMapPath(nodeId, pathIndex, updatedMapPath) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            if (pathIndex >= apiNode.responseMapPathList.length) {
                throw new AppError("Response map path index out of bounds", 400);
            }

            apiNode.responseMapPathList[pathIndex] = updatedMapPath;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Response map path updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== remove response map path ===========//
    async removeResponseMapPath(nodeId, pathIndex) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.responseMapPathList.splice(pathIndex, 1);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "Response map path removed successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== add url parameter ===========//
    async addUrlParam(nodeId, param) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.urlParams.push(param);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "URL parameter added successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== update url parameter ===========//
    async updateUrlParam(nodeId, paramIndex, updatedParam) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            if (paramIndex >= apiNode.urlParams.length) {
                throw new AppError("URL parameter index out of bounds", 400);
            }

            apiNode.urlParams[paramIndex] = updatedParam;
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "URL parameter updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // =========== remove url parameter ===========//
    async removeUrlParam(nodeId, paramIndex) {
        try {
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new AppError("API node not found", 404);
            }

            apiNode.urlParams.splice(paramIndex, 1);
            const updatedNode = await apiNode.save();

            return {
                success: true,
                message: "URL parameter removed successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }









    

    // ================== add response status ==================//
    async addResponseStatus(flowId, nodeId, updates) {
        try {
            console.log("addResponseStatus - Request data:", { flowId, nodeId, updates });

            // Find the flow first
            const flow = await this.flowModel.findById(flowId);
            if (!flow) {
                throw new Error('Flow not found');
            }

            // Check if node exists in flow
            const nodeInFlow = flow.nodes.find(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'ApiNode'
            );
            
            console.log("Looking for node:", nodeId);
            console.log("Found node in flow:", nodeInFlow);

            if (!nodeInFlow) {
                throw new Error('API node not found in flow');
            }

            // Find the actual API node document
            const apiNode = await ApiNode.findById(nodeId);
            if (!apiNode) {
                throw new Error('API node document not found');
            }

            // Keep track of all edges that should remain
            let currentEdges = flow.edges.filter(edge => {
                // Keep edges from other nodes
                if (edge.source.toString() !== nodeId) return true;
                
                // For edges from this node, find the corresponding response status
                const responseStatus = apiNode.responseStatus.find(
                    status => status.next === edge.target.toString()
                );
                
                // Keep the edge if it's for a different status code
                return responseStatus && responseStatus.status !== updates.status;
            });
            console.log("Filtered existing edges:", JSON.stringify(currentEdges, null, 2));

            // Add the new response status to the API node
            if (!apiNode.responseStatus) {
                apiNode.responseStatus = [];
            }

            // Update or add the response status
            const existingStatusIndex = apiNode.responseStatus.findIndex(
                status => status.status === updates.status
            );

            if (existingStatusIndex !== -1) {
                apiNode.responseStatus[existingStatusIndex] = {
                    status: updates.status,
                    next: updates.next
                };
            } else {
                apiNode.responseStatus.push({
                    status: updates.status,
                    next: updates.next
                });
            }

            // Add new edge if next node is specified
            if (updates.next) {
                currentEdges.push({
                    source: nodeId,
                    target: updates.next
                });
            }

            // Update flow edges
            flow.edges = currentEdges;

            console.log("Final API node before save:", JSON.stringify(apiNode, null, 2));
            console.log("Final edges before save:", JSON.stringify(flow.edges, null, 2));

            // Save both the API node and flow
            const updatedNode = await apiNode.save();
            await flow.save();
            console.log("Flow and node saved successfully");

            // Get the updated flow with all populated data
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: 'Response status and edge added successfully',
                data: updatedFlow.data
            };
        } catch (error) {
            console.error("Error in addResponseStatus:", error);
            throw error;
        }
    }
}
