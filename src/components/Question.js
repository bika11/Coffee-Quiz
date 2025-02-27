import React from 'react';
import PropTypes from 'prop-types';
import AnswerButton from './AnswerButton';

function Question({ question, onAnswerSelected }) {
  return (
    <div>
      <h2>{question.question_text}</h2>
      <ul>
        {question.answers.map((answer) => (
          <li key={answer.answer_id}>
            <AnswerButton
              answerText={answer.answer_text}
              answerId={answer.answer_id}
              onAnswerSelected={onAnswerSelected}
            />
          </li>
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
  onAnswerSelected: PropTypes.func.isRequired,
};

export default Question;
