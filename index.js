// Import initial data and UUID generator
import { tweetsData as initialData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// Load tweets from localStorage or fallback to initialData
let tweetsData = JSON.parse(localStorage.getItem('tweetsData')) || initialData

// Listen for all button/icon clicks
document.addEventListener('click', function(e){
    if(e.target.dataset.like){
        handleLikeClick(e.target.dataset.like)
    } else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    } else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    } else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    } else if(e.target.dataset.delete){
        handleDeleteClick(e.target.dataset.delete)
    } else if(e.target.dataset.replySubmit){
        handleReplySubmit(e.target.dataset.replySubmit)
    }
})

// Save tweets to localStorage
function saveToLocalStorage() {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
}

// Toggle like
function handleLikeClick(tweetId){ 
    const tweet = tweetsData.find(t => t.uuid === tweetId)
    tweet.isLiked = !tweet.isLiked
    tweet.likes += tweet.isLiked ? 1 : -1
    saveToLocalStorage()
    render()
}

// Toggle retweet
function handleRetweetClick(tweetId){
    const tweet = tweetsData.find(t => t.uuid === tweetId)
    tweet.isRetweeted = !tweet.isRetweeted
    tweet.retweets += tweet.isRetweeted ? 1 : -1
    saveToLocalStorage()
    render()
}

// Toggle reply input box under the tweet
function handleReplyClick(tweetId) {
    const repliesEl = document.getElementById(`replies-${tweetId}`)
    const replyBoxId = `reply-box-${tweetId}`

    // Unhide the replies container
    repliesEl.classList.remove('hidden')

    // If reply box already exists, remove it
    const existingBox = document.getElementById(replyBoxId)
    if (existingBox) {
        existingBox.remove()
        return
    }

    // Create a reply input box and button
    const replyBox = document.createElement('div')
    replyBox.id = replyBoxId
    replyBox.classList.add('reply-box')
    replyBox.innerHTML = `
        <textarea class="reply-input" placeholder="Write a reply..."></textarea>
        <button class="reply-btn" data-reply-submit="${tweetId}">Reply</button>
    `

    // Append reply box at the end of replies
    repliesEl.appendChild(replyBox)
}


// Add a reply to the selected tweet
function handleReplySubmit(tweetId) {
    const replyInput = document.querySelector(`#reply-box-${tweetId} .reply-input`)
    const replyText = replyInput.value.trim()

    if (replyText) {
        const tweet = tweetsData.find(t => t.uuid === tweetId)
        tweet.replies.push({
            handle: '@PhaniBhushan',
            profilePic: 'images/phani-waterfall.png',
            tweetText: replyText
        })
        saveToLocalStorage()
        render()
    }
}

// Add new tweet
function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@PhaniBhushan`,
            profilePic: `images/phani-waterfall.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        saveToLocalStorage()
        render()
        tweetInput.value = ''
    }
}

// Delete tweet by its ID
function handleDeleteClick(tweetId){
    tweetsData = tweetsData.filter(tweet => tweet.uuid !== tweetId)
    saveToLocalStorage()
    render()
}

// Generate tweet feed HTML
function getFeedHtml(){
    let feedHtml = ``

    tweetsData.forEach(function(tweet){
        const likeIconClass = tweet.isLiked ? 'liked' : ''
        const retweetIconClass = tweet.isRetweeted ? 'retweeted' : ''

        let repliesHtml = ''
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${reply.handle}</p>
            <p class="tweet-text">${reply.tweetText}</p>
        </div>
    </div>
</div>`
            })
        }

        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
                    ${tweet.retweets}
                </span>
            </div>

            ${tweet.handle === '@PhaniBhushan' ? `
                <button class="delete-btn" data-delete="${tweet.uuid}">
                    Delete
                </button>` : ''}
        </div>            
    </div>

    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>`
    })

    return feedHtml 
}

// Render everything inside the feed container
function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()
