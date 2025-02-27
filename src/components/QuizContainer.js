import React, { useContext, useState, useEffect } from 'react';
import { QuizContext } from '../context/QuizContext';
import Question from './Question';

function QuizContainer() {
  const { state, dispatch } = useContext(QuizContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAnswerSelected = (questionId, answerId) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, answerId } });
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/getQuestions');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error("Could not fetch questions:", error);
      }
    }

    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Quiz Container</h1>
      {questions.length > 0 ? (
        <Question
          question={questions[0]}
          onAnswerSelected={handleAnswerSelected}
        />
      ) : (
        <div>No questions available.</div>
      )}
    </div>
  );
}

export default QuizContainer;
