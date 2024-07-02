import React, { useState, useEffect } from 'react';
import { create, all } from 'mathjs';
import './App.css';
import Display from './components/Display';
import Button from './components/Button';
import History from './components/History';

// Create a mathjs instance
const math = create(all);

// Define custom functions with angle unit handling
const isDegrees = (angleUnit) => angleUnit === 'deg';
const degreesToRadians = (angle) => (angle * Math.PI) / 180;
const radiansToDegrees = (angle) => (angle * 180) / Math.PI;

const customFunctions = (angleUnit) => ({
  sin: (x) => (isDegrees(angleUnit) ? Math.sin(degreesToRadians(x)) : Math.sin(x)),
  cos: (x) => (isDegrees(angleUnit) ? Math.cos(degreesToRadians(x)) : Math.cos(x)),
  tan: (x) => (isDegrees(angleUnit) ? Math.tan(degreesToRadians(x)) : Math.tan(x)),
  asin: (x) => (isDegrees(angleUnit) ? radiansToDegrees(Math.asin(x)) : Math.asin(x)),
  acos: (x) => (isDegrees(angleUnit) ? radiansToDegrees(Math.acos(x)) : Math.acos(x)),
  atan: (x) => (isDegrees(angleUnit) ? radiansToDegrees(Math.atan(x)) : Math.atan(x)),
  log: (x) => Math.log(x),
  log2: (x) => Math.log2(x),
  log10: (x) => Math.log10(x),
  sqrt: (x) => Math.sqrt(x),
  pow: (x, y) => Math.pow(x, y),
  exp: (x) => Math.exp(x),
  inv: (x) => 1 / x,
});

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentMode, setCurrentMode] = useState('basic');
  const [memory, setMemory] = useState(null);
  const [angleUnit, setAngleUnit] = useState('deg');

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    clearCalculator();
  };

  const handleClick = (value) => {
    setInput((prev) => prev + value);
    setError('');
  };

  const handleClear = () => {
    clearCalculator();
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      let evalResult;
      switch (currentMode) {
        case 'basic':
          evalResult = math.evaluate(input);
          break;
        case 'advanced':
          evalResult = evaluateAdvanced(input);
          break;
        case 'metric':
          evalResult = evaluateMetric(input);
          break;
        default:
          evalResult = math.evaluate(input);
          break;
      }
      if (!Number.isFinite(evalResult)) {
        throw new Error('Result is not finite');
      }
      setResult(evalResult.toString());
      addToHistory(`${input} = ${evalResult}`);
      setError('');
    } catch (err) {
      if (err instanceof SyntaxError || err instanceof TypeError) {
        setError('Syntax Error');
      } else if (err instanceof EvalError || err instanceof RangeError) {
        setError('Evaluation Error');
      } else if (err.message === 'Result is not finite') {
        setError('Error: Division by zero');
      } else {
        setError('Error');
      }
      setResult('');
    }
  };

  const clearCalculator = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const addToHistory = (expression) => {
    setHistory((prev) => [...prev, expression]);
  };

  const storeMemory = () => {
    setMemory(result);
  };

  const recallMemory = () => {
    if (memory !== null) {
      setInput((prev) => prev + memory);
    }
  };

  const clearMemory = () => {
    setMemory(null);
  };

  const evaluateAdvanced = (input) => {
    const scope = customFunctions(angleUnit);
    return math.evaluate(input, scope);
  };

  const evaluateMetric = (input) => {
    const convertFunctions = {
      'm to km': (value) => value * 0.001,
      'km to m': (value) => value * 1000,
      'm to cm': (value) => value * 100,
      'cm to m': (value) => value * 0.01,
      'm to mm': (value) => value * 1000,
      'mm to m': (value) => value * 0.001,
      'km to miles': (value) => value * 0.621371,
      'miles to km': (value) => value * 1.60934,
      'kg to g': (value) => value * 1000,
      'g to kg': (value) => value * 0.001,
      'kg to mg': (value) => value * 1e+6,
      'mg to kg': (value) => value * 1e-6,
      'cm to mm': (value) => value * 10,
      'mm to cm': (value) => value * 0.1,
      'inch to cm': (value) => value * 2.54,
      'cm to inch': (value) => value * 0.393701,
      '°C to °F': (value) => (value * 9/5) + 32,
      '°F to °C': (value) => (value - 32) * 5/9,
      'K to °C': (value) => value - 273.15,
      '°C to K': (value) => value + 273.15,
    };

    const match = Object.keys(convertFunctions).find((key) => input.includes(key));
    if (match) {
      const value = math.evaluate(input.replace(match, '').trim());
      return convertFunctions[match](value);
    }

    return math.evaluate(input);
  };

  const handleKeyPress = (event) => {
    const { key } = event;
    if ((/[0-9/*\-+.()]/).test(key)) {
      handleClick(key);
    } else if (key === 'Enter') {
      handleCalculate();
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === 'Escape') {
      handleClear();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [input]);

  const toggleAngleUnit = () => {
    setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg');
  };

  let operationsComponent;
  switch (currentMode) {
    case 'basic':
      operationsComponent = (
        <div className="buttons">
          <Button label="AC" handleClick={handleClear} id="AC" />
          <Button label="←" handleClick={handleBackspace} />
          <Button label="%" handleClick={() => handleClick('%')} />
          <Button label="/" handleClick={() => handleClick('/')} />
          <Button label="(" handleClick={() => handleClick('(')} />
          <Button label=")" handleClick={() => handleClick(')')} />
          <Button label="*" handleClick={() => handleClick('*')} />
          <Button label="-" handleClick={() => handleClick('-')} />
          <Button label="1" handleClick={() => handleClick('1')} />
          <Button label="7" handleClick={() => handleClick('7')} />
          <Button label="8" handleClick={() => handleClick('8')} />
          <Button label="9" handleClick={() => handleClick('9')} />
          <Button label="4" handleClick={() => handleClick('4')} />
          <Button label="5" handleClick={() => handleClick('5')} />
          <Button label="6" handleClick={() => handleClick('6')} />
          <Button label="2" handleClick={() => handleClick('2')} />
          <Button label="3" handleClick={() => handleClick('3')} />
          <Button label="0" handleClick={() => handleClick('0')} />
          <Button label="+" handleClick={() => handleClick('+')} />
          <Button label="=" handleClick={handleCalculate} id="equals"/>
          <Button label="." handleClick={() => handleClick('.')} />
          <Button label="M+" handleClick={storeMemory} />
          <Button label="MR" handleClick={recallMemory} />
          <Button label="MC" handleClick={clearMemory} />
        </div>
      );
      break;
    case 'advanced':
      operationsComponent = (
        <div className="buttons">
          <Button label="sin" handleClick={() => handleClick('sin(')} />
          <Button label="cos" handleClick={() => handleClick('cos(')} />
          <Button label="tan" handleClick={() => handleClick('tan(')} />
          <Button label="log" handleClick={() => handleClick('log(')} />
          <Button label="ln" handleClick={() => handleClick('log(')} />
          <Button label="sqrt" handleClick={() => handleClick('sqrt(')} />
          <Button label="pow" handleClick={() => handleClick('pow(')} />
          <Button label="exp" handleClick={() => handleClick('exp(')} />
          <Button label="inv" handleClick={() => handleClick('inv(')} />
          <Button label="(" handleClick={() => handleClick('(')} />
          <Button label=")" handleClick={() => handleClick(')')} />
          <Button label="AC" handleClick={handleClear} id="AC"/>
          <Button label="←" handleClick={handleBackspace} />
          <Button label="%" handleClick={() => handleClick('%')} />
          <Button label=")" handleClick={() => handleClick(')')} />
          <Button label="*" handleClick={() => handleClick('*')} />
          <Button label="-" handleClick={() => handleClick('-')} />
          <Button label="+" handleClick={() => handleClick('+')} />
          <Button label="=" handleClick={handleCalculate} id="equals" />
          <Button label="." handleClick={() => handleClick('.')} />
          <Button label="1" handleClick={() => handleClick('1')} />
          <Button label="7" handleClick={() => handleClick('7')} />
          <Button label="8" handleClick={() => handleClick('8')} />
          <Button label="9" handleClick={() => handleClick('9')} />
          <Button label="4" handleClick={() => handleClick('4')} />
          <Button label="5" handleClick={() => handleClick('5')} />
          <Button label="6" handleClick={() => handleClick('6')} />
          <Button label="2" handleClick={() => handleClick('2')} />
          <Button label="3" handleClick={() => handleClick('3')} />
          <Button label="0" handleClick={() => handleClick('0')} />
          <Button label="M+" handleClick={storeMemory} />
          <Button label="MR" handleClick={recallMemory} />
          <Button label="MC" handleClick={clearMemory} />
        </div>
      );
      break;
    case 'metric':
      operationsComponent = (
        <div className="metric-converter">
          <div className="input-group">
            <input type="number" placeholder="Value" onChange={(e) => setInput(e.target.value)} />
            <select onChange={(e) => setInput((prev) => prev + e.target.value)}>
              <option value="">Select Conversion</option>
              <option value=" m to km">m to km</option>
              <option value=" km to m">km to m</option>
              <option value=" m to cm">m to cm</option>
              <option value=" cm to m">cm to m</option>
              <option value=" m to mm">m to mm</option>
              <option value=" mm to m">mm to m</option>
              <option value=" km to miles">km to miles</option>
              <option value=" miles to km">miles to km</option>
              <option value=" kg to g">kg to g</option>
              <option value=" g to kg">g to kg</option>
              <option value=" kg to mg">kg to mg</option>
              <option value=" mg to kg">mg to kg</option>
              <option value=" cm to mm">cm to mm</option>
              <option value=" mm to cm">mm to cm</option>
              <option value=" inch to cm">inch to cm</option>
              <option value=" cm to inch">cm to inch</option>
              <option value=" °C to °F">°C to °F</option>
              <option value=" °F to °C">°F to °C</option>
              <option value=" K to °C">K to °C</option>
              <option value=" °C to K">°C to K</option>
            </select>
          </div>
          <div className="equals">=</div>
          <div className="result">{result}</div>
          <button onClick={handleCalculate}>Convert</button>
        </div>
      );
      break;
    default:
      operationsComponent = (
        <div className="buttons">
          <Button label="AC" handleClick={handleClear} id="AC" />
          <Button label="←" handleClick={handleBackspace} />
          <Button label="%" handleClick={() => handleClick('%')} />
          <Button label="/" handleClick={() => handleClick('/')} />
          <Button label="(" handleClick={() => handleClick('(')} />
          <Button label=")" handleClick={() => handleClick(')')} />
          <Button label="*" handleClick={() => handleClick('*')} />
          <Button label="-" handleClick={() => handleClick('-')} />
          <Button label="1" handleClick={() => handleClick('1')} />
          <Button label="7" handleClick={() => handleClick('7')} />
          <Button label="8" handleClick={() => handleClick('8')} />
          <Button label="9" handleClick={() => handleClick('9')} />
          <Button label="4" handleClick={() => handleClick('4')} />
          <Button label="5" handleClick={() => handleClick('5')} />
          <Button label="6" handleClick={() => handleClick('6')} />
          <Button label="2" handleClick={() => handleClick('2')} />
          <Button label="3" handleClick={() => handleClick('3')} />
          <Button label="0" handleClick={() => handleClick('0')} />
          <Button label="+" handleClick={() => handleClick('+')} />
          <Button label="=" handleClick={handleCalculate} id="equals"/>
          <Button label="." handleClick={() => handleClick('.')} />
          <Button label="M+" handleClick={storeMemory} />
          <Button label="MR" handleClick={recallMemory} />
          <Button label="MC" handleClick={clearMemory} />
        </div>
      );
      break;
  }

  return (
    <div className="app">
      <div className="navbar">
        <button className={currentMode === 'basic' ? 'active' : ''} onClick={() => handleModeChange('basic')}>Basic</button>
        <button className={currentMode === 'advanced' ? 'active' : ''} onClick={() => handleModeChange('advanced')}>Advanced</button>
        <button className={currentMode === 'metric' ? 'active' : ''} onClick={() => handleModeChange('metric')}>Metric</button>
        <div className="toggle-angle">
          <label>Angle Unit:</label>
          <select value={angleUnit} onChange={toggleAngleUnit}>
            <option value="deg">Degrees</option>
            <option value="rad">Radians</option>
          </select>
        </div>
      </div>
      <div className="welcome-message">
      <h1>Welcome to my Scientific Calculator</h1>
    </div>
      <div className="calculator">
        <Display input={input} result={result} error={error} />
        {operationsComponent}
        <History history={history} />
        <div className="memory">
          <h3>Memory</h3>
          <span>{memory !== null ? memory : 'No value stored'}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
