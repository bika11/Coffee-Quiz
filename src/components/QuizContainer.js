import React, { useContext } from 'react';
import { QuizContext } from '../context/QuizContext';
import Question from './Question';
import questions from '../data/questions';

function QuizContainer() {
  const { state, dispatch } = useContext(QuizContext);

  const handleAnswerSelected = (questionId, answerId) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, answerId } });
  };

  return (
    <div>
      <h1>Quiz Container</h1>
      <Question
        question={questions[0]}
        onAnswerSelected={handleAnswerSelected}
      />
    </div>
  );
}

export default QuizContainer;
