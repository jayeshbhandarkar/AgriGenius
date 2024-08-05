$(function() {
    var synth = window.speechSynthesis;
    var msg = new SpeechSynthesisUtterance();
    var voices = synth.getVoices();
    msg.voice = voices[0];
    msg.rate = 1;
    msg.pitch = 1;

    function appendMessage(message, isUser) {
        var messageClass = isUser ? 'user-message' : 'bot-message';
        var logoHTML = isUser ? '' : '<div class="bot-logo"><img src="../static/robo.png" alt="AgriGenius Logo"></div>';
        var userImageHTML = isUser ? '<div class="user-image"><img src="../static/user.png" alt="User"></div>' : '';
        var messageElement = $('<div class="message-container ' + (isUser ? 'user-container' : 'bot-container') + '">' + 
                            logoHTML + 
                            '<div class="message ' + messageClass + '"></div>' +
                            userImageHTML +
                           '</div>');
        $('.chat-messages').append(messageElement);

        if (isUser) {
            messageElement.find('.message').text(message);
        } else {
            typeMessage(message, messageElement.find('.message'));
        }

        $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
    }

    function typeMessage(message, element, speed = 15) {
        let i = 0;
        element.html('');
        const typingInterval = setInterval(() => {
            if (i < message.length) {
                element.html(element.html() + message.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
            $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
        }, speed);
    }

    function showTypingIndicator() {
        var typingIndicator = $('<div class="typing-indicator bot-message"><span></span><span></span><span></span></div>');
        $('.chat-messages').append(typingIndicator);
        $('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
    }

    function removeTypingIndicator() {
        $('.typing-indicator').remove();
    }

    $('#chatbot-form-btn').click(function(e) {
        e.preventDefault();
        sendMessage();
    });

    $('#messageText').keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            sendMessage();
        }
    });

    var isProcessing = false;

    function disableInput() {
        $('#messageText').prop('disabled', true);
        $('#chatbot-form-btn').prop('disabled', true);
        $('#chatbot-form-btn-voice').prop('disabled', true);
    }

    function enableInput() {
        $('#messageText').prop('disabled', false);
        $('#chatbot-form-btn').prop('disabled', false);
        $('#chatbot-form-btn-voice').prop('disabled', false);
    }

    function sendMessage() {
        var message = $('#messageText').val().trim();
        if (message && !isProcessing) {
            isProcessing = true;
            disableInput();
            
            appendMessage(message, true);
            $('#messageText').val('');
            showTypingIndicator();

            $.ajax({
                type: "POST",
                url: "/ask",
                data: { messageText: message },
                success: function(response) {
                    removeTypingIndicator();
                    if (response.error) {
                        appendMessage("Error: " + response.error, false);
                    } else {
                        var answer = response.answer;
                        appendMessage(answer, false);

                        if ($('#voiceReadingCheckbox').is(':checked')) {
                            msg.text = answer;
                            synth.speak(msg);
                        }
                    }
                    isProcessing = false;
                    enableInput();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    removeTypingIndicator();
                    console.log(errorThrown);
                    appendMessage("Sorry, there was an error processing your request. Please try again later.", false);
                    isProcessing = false;
                    enableInput();
                }
            });
        }
    }

    var welcomeMessage = "🌱🌾 Welcome to AgriGenius !! 🌾🌱 Hi there! I'm AgriGenius, your virtual assistant for Agriculture. How can I assist you today?";

    $('#chatbot-form-btn-clear').click(function(e) {
        e.preventDefault();
        $('.chat-messages').empty();
        appendMessage(welcomeMessage, false);
    });

    $('#chatbot-form-btn-voice').click(function(e) {
        e.preventDefault();

        if ('webkitSpeechRecognition' in window && !isProcessing) {
            var recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();

            recognition.onresult = function(event) {
                var speechResult = event.results[0][0].transcript;
                $('#messageText').val(speechResult);
                sendMessage();
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
            };
        } else {
            console.log('Web Speech API is not supported in this browser or processing is in progress');
        }
    });

    $('#voiceReadingCheckbox').change(function() {
        if (!$(this).is(':checked')) {
            synth.cancel();
        }
    });

    setTimeout(function() {
        appendMessage(welcomeMessage, false);
    }, 500);
});