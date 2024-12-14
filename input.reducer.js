import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getFlowApiAsync } from "./flow.reducer";

const initialState = {
    selectedInputNode: null,
    loading: false,
    error: null
};

// Update input node
export const updateInputNode = createAsyncThunk(
    'inputNode/update',
    async ({ flowId, nodeId, updates }, thunkApi) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/inputs/updateInputNode`,
                { flowId, nodeId, updates },
                { withCredentials: true }
            );
            
            // Update the flow state with the new node data
            if (response.data?.data) {
                // First update the flow state
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                // Then set the selected node in flow state
                const currentNode = response.data.data.nodes.find(node => node._id === nodeId);
                if (currentNode) {
                    thunkApi.dispatch({
                        type: 'flow/setSelectedNode',
                        payload: nodeId
                    });
                }
            }
           

            return response.data;
        } catch (error) {
            console.error('Error updating input node:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);

const inputNodeSlice = createSlice({
    name: 'inputNode',
    initialState,
    reducers: {
        setSelectedInputNode(state, action) {
            state.selectedInputNode = action.payload;
        },
        clearSelectedInputNode(state) {
            state.selectedInputNode = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateInputNode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateInputNode.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateInputNode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setSelectedInputNode, clearSelectedInputNode } = inputNodeSlice.actions;
export const inputNodeReducer = inputNodeSlice.reducer;
export const inputNodeSelector = (state) => state.inputNode;
