import React from 'react';
import PropTypes from 'prop-types';

function AnswerButton({ answerText, answerId, onAnswerSelected }) {
  return (
    <button onClick={() => onAnswerSelected(answerId)}>
      {answerText}
    </button>
  );
}

AnswerButton.propTypes = {
  answerText: PropTypes.string.isRequired,
  answerId: PropTypes.number.isRequired,
  onAnswerSelected: PropTypes.func.isRequired,
};

export default AnswerButton;
