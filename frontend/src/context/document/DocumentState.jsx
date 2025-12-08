import React, { useReducer } from 'react';
import axios from 'axios';
import DocumentContext from './DocumentContext';
import documentReducer from './documentReducer';
import {
    GET_DOCUMENTS,
    ADD_DOCUMENT,
    DELETE_DOCUMENT,
    SET_CURRENT,
    CLEAR_CURRENT,
    UPDATE_DOCUMENT,
    FILTER_DOCUMENTS,
    CLEAR_FILTER,
    DOCUMENT_ERROR,
    CLEAR_DOCUMENTS
    , GET_DOCUMENT, CLEAR_DOCUMENT_ERRORS
} from './types';

const DocumentState = props => {
    const initialState = {
        documents: [],
        current: null,
        filtered: null,
        error: null,
        loading: true
    };

    const [state, dispatch] = useReducer(documentReducer, initialState);

    // Get Documents
    const getDocuments = async ({ page = 1, limit = 20, filters = {} } = {}) => {
        try {
            const params = { page, limit, ...filters };
            const res = await axios.get('/documents', { params });

            dispatch({
                type: GET_DOCUMENTS,
                payload: res.data
            });
        } catch (err) {
                    const errorMsg = err.response?.data?.msg || 'Server Error';
                    dispatch({
                        type: DOCUMENT_ERROR,
                        payload: errorMsg
                    });        }
    };

    // Add Document
    const addDocument = async document => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('/documents', document, config);

            dispatch({
                type: ADD_DOCUMENT,
                payload: res.data
            });
        } catch (err) {
                    const errorMsg = err.response?.data?.msg || 'Server Error';
                    dispatch({
                        type: DOCUMENT_ERROR,
                        payload: errorMsg
                    });        }
    };

    // Forward Document (assign to another user)
    const forwardDocument = async (id, toUserId, role = 'viewer') => {
        const config = { headers: { 'Content-Type': 'application/json' } };
        try {
            const res = await axios.post(`/documents/${id}/forward`, { toUserId, role }, config);
            dispatch({ type: UPDATE_DOCUMENT, payload: res.data });
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Server Error';
            dispatch({ type: DOCUMENT_ERROR, payload: errorMsg });
        }
    };

    // Export Documents (server side) - accepts ids or filters
    const exportDocuments = async (data) => {
        try {
            const res = await axios.post('/documents/export', data, { responseType: 'blob' });
            return res.data;
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Server Error';
            dispatch({ type: DOCUMENT_ERROR, payload: errorMsg });
        }
    };

    // Bulk Action
    const bulkAction = async (action, ids, payload) => {
        try {
            const res = await axios.post('/documents/bulk', { action, ids, payload });
            // Optionally refresh documents
            getDocuments();
            return res.data;
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Server Error';
            dispatch({ type: DOCUMENT_ERROR, payload: errorMsg });
        }
    };

    // Delete Document
    const deleteDocument = async id => {
        try {
            await axios.delete(`/documents/${id}`);

            dispatch({
                type: DELETE_DOCUMENT,
                payload: id
            });
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Server Error';
            dispatch({
                type: DOCUMENT_ERROR,
                payload: errorMsg
            });
            return false;
        }
    };

    // Update Document
    const updateDocument = async document => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.put(`/documents/${document._id}`, document, config);

            dispatch({
                type: UPDATE_DOCUMENT,
                payload: res.data
            });
        } catch (err) {
                    const errorMsg = err.response?.data?.msg || 'Server Error';
                    dispatch({
                        type: DOCUMENT_ERROR,
                        payload: errorMsg
                    });        }
    };

    // Get Document
    const getDocument = async (id, { skipRefresh = false } = {}) => {
        try {
            const res = await axios.get(`/documents/${id}`);

            dispatch({
                type: GET_DOCUMENT,
                payload: res.data
            });
        } catch (err) {
                    const errorMsg = err.response?.data?.msg || 'Server Error';
                    dispatch({
                        type: DOCUMENT_ERROR,
                        payload: errorMsg
                    });        }
    };

    // Clear Documents
    const clearDocuments = () => {
        dispatch({ type: CLEAR_DOCUMENTS });
    };

    // Set Current Document
    const setCurrent = document => {
        dispatch({ type: SET_CURRENT, payload: document });
    };

    // Clear Current Document
    const clearCurrent = () => {
        dispatch({ type: CLEAR_CURRENT });
    };

    // Filter Documents
    const filterDocuments = text => {
        dispatch({ type: FILTER_DOCUMENTS, payload: text });
    };

    // Clear Filter
    const clearFilter = () => {
        dispatch({ type: CLEAR_FILTER });
    };

    // Clear Document Errors
    const clearDocumentErrors = () => dispatch({ type: CLEAR_DOCUMENT_ERRORS });

    return (
        <DocumentContext.Provider
            value={{
                documents: state.documents,
                current: state.current,
                filtered: state.filtered,
                error: state.error,
                total: state.total,
                page: state.page,
                totalPages: state.totalPages,
                getDocuments,
                getDocument,
                addDocument,
                deleteDocument,
                setCurrent,
                clearCurrent,
                updateDocument,
                forwardDocument,
                exportDocuments,
                bulkAction,
                filterDocuments,
                clearFilter,
                clearDocuments,
                clearDocumentErrors
            }}
        >
            {props.children}
        </DocumentContext.Provider>
    );
};

export default DocumentState;
