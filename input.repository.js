import InputNode from "./inputSchema.js";
import { AppError } from "../../middleware/errorHandler.middleware.js";
import FlowRepository from "../flow/flow.repository.js";
import flowModel from "../flow/flowSchema.js";

export default class InputRepository {

    constructor() {
        this.flowRepository = new FlowRepository();
    }

    // ========== create input node ===========//
    async createInputNode(flowId, position) {
        try {
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            const newInputNode = new InputNode({
                type: 'input',
                position: position,
            });

            const savedInputNode = await newInputNode.save();

            // Add the node to the flow's nodes array
            flow.nodes.push({
                type: 'input',
                ref: savedInputNode._id,
                refModel: 'InputNode',
                label: savedInputNode.label
            });

            await flow.save();

            return {
                success: true,
                message: "Input node created successfully",
                data: savedInputNode
            };

        } catch (error) {
            throw error;
        }
    }

    // ========== update input node ===========//
    async updateInputNode(flowId, nodeId, updates, userId) {
        try {
            // Find the input node
            const inputNode = await InputNode.findById(nodeId);
            if (!inputNode) {
                throw new AppError("Input node not found", 404);
            }

            // Get the flow and verify ownership
            const flow = await flowModel.findOne({ _id: flowId, user: userId });
            if (!flow) {
                throw new AppError("Flow not found or unauthorized", 404);
            }

            // Update label if provided
            if (updates.label) {
                inputNode.label = updates.label;
            }

            // Update data fields if provided
            if (updates.data) {
                inputNode.data = {
                    ...inputNode.data || {},
                    ...updates.data
                };
            }

            // Save the updated input node
            await inputNode.save();

            // Get the updated flow
            const updatedFlow = await this.flowRepository.getUserFlow(userId);

            return {
                success: true,
                message: "Input node updated successfully",
                data: updatedFlow.data
            };

        } catch (error) {
            throw error;
        }
    }

    // ========== delete input node ===========//
    async deleteInputNode(flowId, nodeId) {
        try {
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Remove the node from the flow's nodes array
            flow.nodes = flow.nodes.filter(node => node.ref.toString() !== nodeId);
            await flow.save();

            // Delete the input node
            await InputNode.findByIdAndDelete(nodeId);

            return {
                success: true,
                message: "Input node deleted successfully"
            };

        } catch (error) {
            throw error;
        }
    }
}
