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
            case 'ADD_DETAILS':
                return {
                    ...state,
                    savedJobs: state.savedJobs.map((job) =>
                        job.external_job_id === action.payload.external_job_id ? { ...job, ...action.payload } : job
                    ),
                };
            
            case 'DELETE_JOB':
                return {
                    ...state,
                    savedJobs: state.savedJobs.filter((job) => job.id !== action.payload),
                };
        default:
            return state;
    }
}

// user will be on the redux state at:
// state.user
export default jobsReducer;