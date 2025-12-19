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
    CLEAR_DOCUMENTS,
    GET_DOCUMENT,
    CLEAR_DOCUMENT_ERRORS
} from './types';

export default (state, action) => {
    switch (action.type) {
        case GET_DOCUMENTS:
            return {
                ...state,
                documents: action.payload.documents || [],
                total: action.payload.total || 0,
                page: action.payload.page || 1,
                totalPages: action.payload.totalPages || 1,
                loading: false
            };
        case GET_DOCUMENT:
            return {
                ...state,
                current: action.payload,
                loading: false
            };
        case ADD_DOCUMENT:
            return {
                ...state,
                documents: [action.payload, ...state.documents],
                loading: false
            };
        case UPDATE_DOCUMENT:
            return {
                ...state,
                documents: state.documents.map(document =>
                    document._id === action.payload._id ? action.payload : document
                ),
                loading: false
            };
        case DELETE_DOCUMENT:
            return {
                ...state,
                documents: state.documents.filter(
                    document => document._id !== action.payload
                ),
                loading: false
            };
        case CLEAR_DOCUMENTS:
            return {
                ...state,
                documents: null,
                filtered: null,
                error: null,
                current: null
            };
        case SET_CURRENT:
            return {
                ...state,
                current: action.payload
            };
        case CLEAR_CURRENT:
            return {
                ...state,
                current: null
            };
        case FILTER_DOCUMENTS:
            return {
                ...state,
                filtered: state.documents.filter(document => {
                    const { text, tags, metadata, docRefShort, status, owner, assignedTo } = action.payload;
                    let matches = true;

                    // Filter by text (title/content)
                    const searchText = text || action.payload.search;
                    if (searchText) {
                        const textRegex = new RegExp(searchText, 'gi');
                        matches = matches && (document.title.match(textRegex) || document.content.match(textRegex));
                    }

                    // Filter by tags
                    if (tags) {
                        const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
                        matches = matches && document.tags.some(docTag =>
                            tagsArray.some(filterTag => docTag.toLowerCase().includes(filterTag))
                        );
                    }

                    // Filter by metadata (simple key-value match)
                    if (metadata) {
                        const metadataPairs = metadata.split(',').map(pair => pair.split(':').map(s => s.trim()));
                        matches = matches && metadataPairs.every(([key, value]) =>
                            document.metadata && document.metadata[key] && String(document.metadata[key]).toLowerCase().includes(value.toLowerCase())
                        );
                    }

                    // Filter by shortened docRef
                    if (docRefShort) {
                        matches = matches && (document.docRefShort && String(document.docRefShort).toLowerCase().includes(docRefShort.toLowerCase()));
                    }

                    // Filter by status
                    if (status && status !== 'all') {
                        matches = matches && String(document.status) === String(status);
                    }

                    // Owner filter: owner may be object or id
                    if (owner && owner !== 'all') {
                        const ownerId = (document.owner && (document.owner._id || document.owner)) ? (document.owner._id || document.owner) : null;
                        matches = matches && String(ownerId) === String(owner);
                    }

                    // AssignedTo filter: assignedTo may be object or id
                    if (assignedTo && assignedTo !== 'all') {
                        const assignedId = (document.assignedTo && (document.assignedTo._id || document.assignedTo)) ? (document.assignedTo._id || document.assignedTo) : null;
                        matches = matches && String(assignedId) === String(assignedTo);
                    }

                    // Date Range Filter (CreatedAt)
                    if (action.payload.startDate) {
                        matches = matches && new Date(document.createdAt) >= new Date(action.payload.startDate);
                    }
                    if (action.payload.endDate) {
                        const end = new Date(action.payload.endDate);
                        end.setHours(23, 59, 59, 999);
                        matches = matches && new Date(document.createdAt) <= end;
                    }

                    return matches;
                })
            };
        case CLEAR_FILTER:
            return {
                ...state,
                filtered: null
            };
        case DOCUMENT_ERROR:
            return {
                ...state,
                error: action.payload
            };
        case CLEAR_DOCUMENT_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};
