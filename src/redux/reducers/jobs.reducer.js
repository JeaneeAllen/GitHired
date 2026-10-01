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

        case 'SAVE_DETAILS': {
            // Merge the saved application into its job instead of adding a new row
            // eslint-disable-next-line no-unused-vars -- user_id is dropped so it isn't merged into the job
            const { id, job_id, user_id, ...details } = action.payload;
            return {
                ...state,
                savedJobs: state.savedJobs.map((job) =>
                    job.job_id === job_id ? { ...job, ...details, application_id: id } : job
                )
            };
        }

        case 'REMOVE_SAVED_JOB':
            return {
                ...state,
                savedJobs: state.savedJobs.filter((job) => job.job_id !== action.payload)
            };

        default:
            return state;
    };
    
}

// user will be on the redux state at:
// state.user
export default jobsReducer;