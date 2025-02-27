import React from 'react';
import PropTypes from 'prop-types';

function Question({ question }) {
  return (
    <div>
      <h2>{question.question_text}</h2>
      <ul>
        {question.answers.map((answer) => (
          <li key={answer.answer_id}>{answer.answer_text}</li>
        ))}
      </ul>
    </div>
  );
}

Question.propTypes = {
  question: PropTypes.shape({
    question_id: PropTypes.number.isRequired,
    question_text: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    sort_order: PropTypes.number.isRequired,
    answers: PropTypes.arrayOf(
      PropTypes.shape({
        answer_id: PropTypes.number.isRequired,
        answer_text: PropTypes.string.isRequired,
        sort_order: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Question;
