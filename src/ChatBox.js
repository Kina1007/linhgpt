import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import myImage from './img/Linh.jpg';
import ReactMarkdown from 'react-markdown';
import useSpeechToText from 'react-hook-speech-to-text';
// import path from 'path';
var env = "dev"
const pathenv = env === "dev" ? "http://localhost:3000/" : "http://43.207.79.236:3000/"

const Message = (props) => {
  const { sender, message } = props;
  return (
    <div className={`chat-message`}>
      <div className={`${sender === "bot" ? "bot-message" : "user-message"}`}>
        {sender === "bot" && (
          <div className="avatar-container">
            <img src={myImage} alt="User avatar" />
          </div>
        )}
        <div className="message-container">
          <div className="message-text">
            <ReactMarkdown children={message} />
            {/* {message.split('\n').map((item,index)=>{
            return <p key={index}>{item}</p>
          })} */}
          </div>
        </div>
      </div>

    </div>
  );
}


const ChatBox = () => {
  const messagesEndRef = useRef(null);
  // const messagelist = useRef([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState("vi-VN");
  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    speechRecognitionProperties: {
      lang: selectedLanguage,
      interimResults: true // Allows for displaying real-time speech results
    },
    continuous: false,
    useLegacyResults: false,
  });

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory])

  useEffect(() => {
    // console.log(JSON.stringify(result))
    if (results.length > 1) {
      setMessage(results[results.length - 1].transcript);
      setResults([]);
    }

    console.log(JSON.stringify(interimResult))
  }, [results])
  useEffect(() => {
    // console.log(JSON.stringify(result))
    if (interimResult) {
      setMessage(interimResult);
    }
  }, [interimResult])


  const handleSendMessage = async (event) => {
    if(message.trim() === ""){return}
    event.preventDefault();
    setLoading(true);
    if(message === "/info"){
      const newMessage = { sender: 'user', message };
      const botMessage = { sender: 'bot', message: "```\nĐịa chỉ: 大阪府大阪区此花区高見１ー４ー５４ー１００２号、\nSố điện thoại1: 080-7897-6542(Cảnh)、\nSố điện thoại1: 080-7802-3490(Linh)" };
      setChatHistory([...chatHistory, newMessage, botMessage]);
      setMessage('');
      setLoading(false);
      return;
    }
    if (selectedLanguage === "Huy phan nay roi") {
      const newMessage = { sender: 'user', message };
      try {
        await axios.post(`${pathenv}translate`, {
          text: message,
          target: selectedLanguage
        })
          .then(function (response) {
            var data = response.data;
            const botMessage = { sender: 'bot', message: data[selectedLanguage] };
            setChatHistory([...chatHistory, newMessage, botMessage]);
            setMessage('');
            // setResult(data);
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
      }
    }
    else {
      const newMessage = { sender: 'user', message };
      const textmes = [{ role: "user", content: message }];
      // messagelist.current = [...newMessage.current,newMessage]
      setChatHistory([...chatHistory, newMessage]);
      setMessage('');
      try {
        await axios.post(`${pathenv}openai`, {
          text: textmes
        })
          .then(function (response) {
            var data = response.data;
            var content = data["content"];
            const botMessage = { sender: 'bot', message: content };
            setChatHistory([...chatHistory, newMessage, botMessage]);
            setMessage('');
            // setResult(data);
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  function scrollToBottom() {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <div className="chat-container">
      <div div className="chat-header">
        {/* <div className="logo-container">
          <img src="https://i.pravatar.cc/40" alt="OpenAI logo" />
          <h4>Linh様・翻訳</h4>
        </div> */}
        <div className="language-container">
          <label>
            <input
              type="radio"
              name="language"
              value="en-US"
              checked={selectedLanguage === "en-US"}
              onChange={handleLanguageChange}
            />
            English
          </label>
          <label>
            <input
              type="radio"
              name="language"
              value="ja-JP"
              checked={selectedLanguage === "ja-JP"}
              onChange={handleLanguageChange}
            />
            日本語
          </label>
          <label>
            <input
              type="radio"
              name="language"
              value="vi-VN"
              checked={selectedLanguage === "vi-VN"}
              onChange={handleLanguageChange}
            />
            Việt Nam
          </label>
          {/* <label>
            <input
              type="radio"
              name="language"
              value="chatgpt"
              checked={selectedLanguage === "chatgpt"}
              onChange={handleLanguageChange}
            />
            ChatGPT
          </label> */}
        </div>
      </div>
      <div className="chat-messages">
        {chatHistory.map((message, index) => (
          <Message key={index} sender={message.sender} message={message.message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          className='message-input'
          type="text"
          placeholder="メッセージを入力してください..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type = "button" onClick={interimResult ? stopSpeechToText : startSpeechToText}>
          {isRecording ? 'STOP' : 'REC'}
        </button>
        <button className='message-send' type="submit">{loading ? "処理中..." : "送信"}</button>
      </form>
      {/* <div styles="z-index:9999, margin-bottom:50px">
        <ul>
          {results.map((result) => (
            <li key={result.timestamp}>{result.transcript}</li>
          ))}
          {interimResult && <li>{interimResult}</li>}
        </ul>
        <button onClick={interimResult ? stopSpeechToText : startSpeechToText}>
          {isRecording ? 'Stop REC' : 'Start REC'}
        </button>
      </div> */}
    </div>
  )
}

export default ChatBox