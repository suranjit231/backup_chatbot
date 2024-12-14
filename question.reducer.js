import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    selectedQuestionNode: null,
    loading: false,
    error: null
};



//========== Update quetsion node ===========//
export const updateQuestionTextApi = createAsyncThunk("questionNode/updateTextApi",
    async ({flowId, nodeId, updateText}, thunkApi)=>{
        try{
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/questions/updateQuestionText`, 
            { 
                flowId, 
                nodeId,
                updateText
            },
            { withCredentials: true }
            );

            if(response.data?.success){    
                // Update the flow state with the new data
                thunkApi.dispatch({
                    type: 'flow/updateQuestionText',
                    payload: {
                        nodeId,
                        text: updateText,
                        flow: response.data.data
                    }
                });
            }

            return response.data;
        }catch(error){
            console.error('Error updating question text:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }       
)


// ========== create questions options fields ===============//
export const createQuestionNodeOtionsFields = createAsyncThunk(
    'questionNode/createOtionsFields',
    async ({ flowId, nodeId }, thunkApi) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/questions/createOptions`,
                { flowId, nodeId },
                { withCredentials: true }
            );

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }   

            return response.data;
        } catch (error) {
            console.error('Error creating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  



// ========== update question node options fields ===========//
export const updateQuestionNodeOtionsFieldsApi = createAsyncThunk(
    'questionNode/updateOtionsFields',
    async ({ flowId, nodeId, optionId, updateData }, thunkApi) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/questions/updateOptions`,
                { flowId, nodeId, optionId, updateData },
                { withCredentials: true }
            );

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error updating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  




// ========== questionSlice for managing question state ============//
const questionSlice = createSlice({
    name: 'questionNode',
    initialState,
    reducers: {
        setSelectedQuestionNode(state, action) {
            state.selectedQuestionNode = action.payload;
        },
        clearSelectedQuestionNode(state) {
            state.selectedQuestionNode = null;
        }
    },

    extraReducers: (builder)=>{
        builder
        
        // ========= updating question node text =========//
        .addCase(updateQuestionTextApi.fulfilled, (state, action)=>{

            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })

        //======= creating question node options fields ======//
        .addCase(createQuestionNodeOtionsFields.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })

        //======= updating question node options fields ======//
        .addCase(updateQuestionNodeOtionsFieldsApi.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })
    }
})


export const questionActions = questionSlice.actions;
export const questionReducer = questionSlice.reducer;
export const questionSelector = (state) => state.questionNode;
