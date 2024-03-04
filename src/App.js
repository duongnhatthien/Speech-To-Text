import './App.css';
import { useEffect, useState } from 'react';
import { AudioOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { Flex, Input } from 'antd';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import OpenAI from 'openai';
const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true,
});
const { Search } = Input;
function generateRandomString() {
    if (window.crypto) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
        return token;
    } else {
        return (Math.random() * new Date().getTime())
            .toString(36)
            .replace(/\./g, '');
    }
}
const onSearch = () => {};
function App() {
    const [recorder, setRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [textResult, setTextResult] = useState('');
    const startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                const newRecorder = RecordRTC(stream, {
                    type: 'audio',
                    mimeType: 'audio/mp3',
                });
                newRecorder.startRecording();
                setRecorder(newRecorder);
                setIsRecording(true);
            })
            .catch(function (err) {
                console.log('Không thể truy cập microphone!', err);
            });
    };

    const stopRecording = () => {
        if (recorder) {
            recorder.stopRecording(function () {
                const blob = recorder.getBlob();
                const fileName = generateRandomString() + '.webm';
                const file = new File([blob], fileName, {
                    type: 'audio/webm',
                });
                sendAudioToAPI(file);
            });
            setIsRecording(false);
        }
    };

    const sendAudioToAPI = async (audioBlob) => {
        try {
            // Tạo formData để gửi file
            const formData = new FormData();
            formData.append('file', audioBlob);
            formData.append('model', 'whisper-1');
            console.log(audioBlob);
            //Gửi request POST đến API của OpenAI
            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization:
                            'Bearer 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',
                    },
                }
            );
            // Xử lý kết quả từ API
            setTextResult(response.data.text);
        } catch (error) {
            console.error(
                'Lỗi khi gửi file âm thanh lên API của OpenAI:',
                error
            );
        }
    };

    const pauseRecordingIcon = (
        <PauseCircleOutlined
            onClick={stopRecording}
            style={{
                fontSize: 16,
                color: '#1677ff',
            }}
        />
    );
    const startRecordingIcon = (
        <AudioOutlined
            onClick={startRecording}
            style={{
                fontSize: 16,
                color: '#1677ff',
            }}
        />
    );

    return (
        <Flex
            justify="center"
            align="center"
            style={{
                width: '100vw',
                height: '100vh',
            }}>
            <Search
                value={textResult}
                onChange={(e) => setTextResult(e.target.value)}
                allowClear
                style={{
                    width: '500px',
                }}
                placeholder="input search text"
                enterButton="Search"
                size="large"
                suffix={isRecording ? pauseRecordingIcon : startRecordingIcon}
                onSearch={onSearch}
            />
        </Flex>
    );
}

export default App;
