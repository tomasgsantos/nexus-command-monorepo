import './textAnimation.css';

interface OwnProps {
    text: string;
    fontSize?: number;
}

export const TextHoverAnimation = (props: OwnProps) => {
    const { text, fontSize = 30 } = props;


    return (
      <div className="text-animation-wrap" style={{ height: `${fontSize + 2}px` }}>
        <div className="lowercase">
          {text?.split('').map((e, i) => (
              <span key={`${e}-${i}`} style={{ fontSize: `${fontSize}px`, margin: `${e === ' ' ? '0 2px' : undefined}` }}>{e}</span>
          ))}
        </div>
        <div className="uppercase">
          {text?.split('').map((e, i) => (
              <span key={`${e}-${i}`} style={{ fontSize: `${fontSize}px`, margin: `${e === ' ' ? '0 2px' : undefined}` }}>{e}</span>
          ))}
        </div>
      </div>
    )
};

export default TextHoverAnimation;