// src/views/WeightsEditorView.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWeight } from '../store/weightsSlice';

const WeightsEditorView = () => {
  const weights = useSelector((state) => state.weights);
  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    dispatch(updateWeight({ key, value: parseInt(value, 10) || 0 }));
  };

  return (
    <div className="container">
      <h1>Éditeur de Poids</h1>

      <table>
        <thead>
          <tr>
            <th>Critère</th>
            <th>Poids</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(weights).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeightsEditorView;