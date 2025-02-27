import React, { useContext } from 'react';
import { QuizContext } from '../context/QuizContext';
import Question from './Question';

function QuizContainer() {
  const { state, dispatch } = useContext(QuizContext);

  const handleAnswerSelected = (questionId, answerId) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, answerId } });
  };

  // Mock questions data
  const questions = [
    {
      question_id: 1,
      question_text: 'What is your favorite coffee roast?',
      mode: 'basic',
      sort_order: 1,
      answers: [
        { answer_id: 1, answer_text: 'Light', sort_order: 1 },
        { answer_id: 2, answer_text: 'Medium', sort_order: 2 },
        { answer_id: 3, answer_text: 'Dark', sort_order: 3 },
      ],
    },
  ];

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
