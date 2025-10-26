## Decisions taken

I took a DDD approach, which might be to much for this simple excercicse, but it enforces the separation of concerns and will help us keep things separated and organized while the app grows.

I didn't focus to much on UI improvements, like making components look nice, and I focused more un UX for the sake of the excercise.

- `fetchAPI.ts`: In this file we centralize all calls to our API so we encapsulate all our error handling from the API in a single place
- `Transaction.ts`: I opted to add this entity, which might be a bit of overkill for this simple example, to encapsulate all business logic and validations in a single place, so if we are expecting this app to grow it might come handy in a future. Another simpler way to do so would be using an anticorruption layer where we have method to validate what we send to the API and what we receive from it.

## Improvements to be done

- Add more testing on the UI with react-testing-library to test the component behaviour on different interactions.
- Create a object mother for test mocks so we can centralize the mock creation and reuse them
- Implement a proper date and hour picker for the timestamp input
