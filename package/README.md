# Welcome to the Redux General Store!

We all love redux, sure, but we all know it has one tiny flaw, which is the
amount of boilerplate necessary to get the redux store to be functional. Well no
more!

The Redux General Store generalizes thunks and reducers so that one thunk can
serve any model, and reducers are generated for each model automatically. The
trade-off is that you must specify which model and route to use when calling the
thunk.

For example:

    getUsers()

becomes:

    genericGet('/api/', 'users')

In this example , both strings passed in should be substituted with constants to
guard against typo bugs. That turns it into:

    genericGet(api, users)

Yes, I know, it is slightly more 'wordy' than the original line, but in exchange
for typing few more characters, you get a redux store that is about 10 lines
long and provides thunks and reducers that handle all CRUD operations.
