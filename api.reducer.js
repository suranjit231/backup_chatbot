import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getFlowApiAsync } from "./flow.reducer";

const initialState = {
    selectedApiNode: null,
    loading: false,
    error: null
};

// Update API node
export const addResponseStatusApi = createAsyncThunk(
    'apiNode/update',
    async ({ flowId, nodeId, updates }, thunkApi) => {
        try {


            console.log("updateApiNode thunk - Request data:", { flowId, nodeId, updates });
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/apis/addResponseStatus`,
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
            console.error('Error updating API node:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);

// API Node Slice
const apiNodeSlice = createSlice({
    name: 'apiNode',
    initialState,
    reducers: {
        setSelectedApiNode(state, action) {
            state.selectedApiNode = action.payload;
        },
        clearSelectedApiNode(state) {
            state.selectedApiNode = null;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(addResponseStatusApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addResponseStatusApi.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(addResponseStatusApi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update API node';
            });
    }
});

export const { setSelectedApiNode, clearSelectedApiNode } = apiNodeSlice.actions;
export const apiNodeReducer = apiNodeSlice.reducer;
export const apiNodeSelector = (state) => state.apiNode;
