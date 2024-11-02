const jobsReducer = (state = { jobs: [], savedJobs: [] }, action) => {
    switch (action.type) {
        case 'SET_JOBS':
            return {
                ...state,
                jobs: action.payload
            };
        case 'SAVE_JOB':
            return {
                ...state,
                savedJobs: [...state.savedJobs, action.payload]

            };

        case 'LOAD_SAVED_JOBS':
            return {
                ...state,
                savedJobs: action.payload
            };

            case 'SAVE_DETAILS':
            return {
                ...state,
                savedJobs: [...state.savedJobs, action.payload] // Assuming applications are treated as saved jobs
            };

        default:
            return state;
    };
    
}

// user will be on the redux state at:
// state.user
export default jobsReducer;