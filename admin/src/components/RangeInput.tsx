import styled from 'styled-components';

interface StyledRangeInputProps {
  $progress: number;
}

const RangeInput = styled.input.attrs({ type: 'range' })<StyledRangeInputProps>`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme, $progress }) => `
    linear-gradient(
      to right,
      ${theme.colors.primary600} 0%,
      ${theme.colors.primary600} ${$progress}%,
      ${theme.colors.neutral150} ${$progress}%,
      ${theme.colors.neutral150} 100%
    )
  `};
  outline: none;
  margin-top: 8px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary600};
    cursor: pointer;
    position: relative;
    z-index: 2;
    border: none;
  }

  &::-moz-range-thumb {
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary400};
    cursor: pointer;
    border: none;
  }

  &::-ms-thumb {
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary600};
    cursor: pointer;
    border: none;
  }

  &::-moz-range-track {
    background: transparent;
  }

  &::-ms-track {
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
`;

export default RangeInput;
