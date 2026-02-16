
import { useState, useEffect } from 'react';

const TextType = ({
    text,
    typingSpeed = 50,
    cursorCharacter = "_",
    showCursor = true,
    animate = true
}) => {
    const [displayedText, setDisplayedText] = useState(animate ? "" : text);
    const [isTyping, setIsTyping] = useState(animate);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }

        setDisplayedText("");
        setIsTyping(true);
        let index = 0;

        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, typingSpeed);

        return () => clearInterval(interval);
    }, [text, typingSpeed, animate]);

    return (
        <span>
            {displayedText.split('\n').map((line, i) => (
                <span key={i}>
                    {line}
                    {i < displayedText.split('\n').length - 1 && <br />}
                </span>
            ))}
            {showCursor && isTyping && (
                <span className="animate-pulse">{cursorCharacter}</span>
            )}
        </span>
    );
};

export default TextType;
