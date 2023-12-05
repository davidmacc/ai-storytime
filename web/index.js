const DOMAIN = window.location.hostname;
const apiUrl = "https://" + DOMAIN + "/Prod/story";
const loader = document.getElementById('loader');
const btnGenerateStory = document.getElementById('btnGenerateStory');
const txtStoryTopic = document.getElementById('txtStoryTopic');
const divStoryResult = document.getElementById('divStoryResult');
const audioPlayer = document.getElementById('audioPlayer');
const btnShare = document.getElementById('btnShare');

async function getStory(storyId) {
    const response = await fetch(apiUrl + "/" + storyId, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    console.log(data);
    return data;
}

async function createStory(topic) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic })
    });
    const data = await response.json();
    console.log(data);
    return data;
}

const generateStory = async () => {
    hide(btnGenerateStory);
    show(loader);
    var topic = txtStoryTopic.value
    const pendingStory = await createStory(topic);
    storyId = pendingStory.storyId;

    var status = "";

    for (i = 0; status != "COMPLETE" && i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const story = await getStory(storyId);
        status = story.status;
        if (status == "COMPLETE") {
            window.location.href = "index.html?storyId=" + storyId;
        }
    }
}

const pageLoad = async () => {
    if (window.location.search.includes("storyId")) {
        storyId = window.location.search.split("=")[1];
        const story = await getStory(storyId);

        txtStoryTopic.value = story.prompt;

        const formattedstory = story.storyText.replace(/\n/g, '<br>');
        divStoryResult.innerHTML = formattedstory;
        show(divStoryResult);

        audioUrl = "https://" + DOMAIN + story.storyAudio;
        audioPlayer.src = audioUrl;
        audioPlayer.load();
        show(audioPlayer);

        btnShare.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: 'Check out this link:',
                    url: window.location.href
                })
                    .then(() => console.log('URL shared successfully'))
                    .catch((error) => console.error('Error sharing URL:', error));
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        alert('Link copied to clipboard!');
                    })
                    .catch((error) => {
                        console.error('Error copying text to clipboard:', error);
                        alert('Copy to clipboard failed. Please try again.');
                    });
            }
        });
        show(btnShare);
    }
}

window.onload = function () {
    pageLoad();
};

function show(element) {
    element.style.display = 'block';
}

function hide(element) {
    element.style.display = 'none';
}