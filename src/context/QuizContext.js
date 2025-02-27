import React, { createContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentQuestionIndex: 0,
  answers: [],
  mode: 'basic',
  isComplete: false,
  recommendedCoffeeId: null,
  secondBestCoffeeId: null,
  advancedOptions: {},
};

// Reducer function
const quizReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ANSWER':
      const { questionId, answerId } = action.payload;

      // Check if an answer for the given questionId already exists
      const existingAnswerIndex = state.answers.findIndex(
        (answer) => answer.questionId === questionId
      );

      if (existingAnswerIndex !== -1) {
        // If it exists, update it
        const updatedAnswers = [...state.answers];
        updatedAnswers[existingAnswerIndex] = { questionId, answerId };

        return {
          ...state,
          answers: updatedAnswers,
        };
      } else {
        // Otherwise, add a new answer object to the answers array
        return {
          ...state,
          answers: [...state.answers, { questionId, answerId }],
        };
      }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    case 'SET_COMPLETE':
      return {
        ...state,
        isComplete: action.payload,
      };
    case 'SET_RECOMMENDED_COFFEE':
      return {
        ...state,
        recommendedCoffeeId: action.payload,
      };
    case 'SET_SECOND_BEST_COFFEE':
      return {
        ...state,
        secondBestCoffeeId: action.payload,
      };
    case 'SET_ADVANCED_OPTIONS':
      return {
        ...state,
        advancedOptions: action.payload,
      };
    case 'RESET_QUIZ':
      return initialState;
    default:
      return state;
  }
};

// Create context
const QuizContext = createContext();

// Context provider component
const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};

export { QuizContext, QuizProvider };
