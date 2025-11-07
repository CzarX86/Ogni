import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Basic Test', () => {
  it('should render a simple component', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });
});