import './App.scss';
import React, {createRef, useEffect, useState} from 'react';
import { LikeIcon, ReplyIcon, RetweetIcon, ShareIcon, VerifedIcon } from './component/icons';
import MyLoader from './component/Loader';
import { useScreenshot } from 'use-react-screenshot'
import {language} from './lang/language'


function convertImageToBase64(url, callback, outputFormat){
  var canvas = document.createElement('CANVAS')
  var ctx    = canvas.getContext('2d')
  var img    = new Image
  img.crossOrigin = 'Anonymous'
  img.onload = function(){
    canvas.height = img.height
    canvas.width  = img.width
      ctx.drawImage(img,0,0)
      var dataURL = canvas.toDataUrl(outputFormat || 'image/png')
      callback.call(this, dataURL)
      canvas = null
  }
  img.src = url
}



const tweetFormat = tweet =>{
  tweet = tweet
  .replace(/@([\w]+)/g,'<span>@$1</span>')
  .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
  .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>')
  return tweet
}

const formatNumber = number =>{
  if(!number) {
    number = 0;
  }
  if(number < 1000) {
    return number
  } else {
    number /= 1000;
    number = String(number).split('.')
    return number[0] + ',' + (number[1] >= 100 ? number[1].slice(0,1) + ' B' : ' B')
  }
}



function App() {
  const tweetRef = createRef()
  const downRef  = createRef()
  const [lang, setLang]                    = useState('tr')
  const [languages, setLanguages]          = useState()
  const [name, setName]                    = useState()
  const [username,setUsername]             = useState()
  const [isVerified, setIsVerified]        = useState(0)
  const [tweet, setTweet]                  = useState()
  const [avatar, setAvatar]                = useState()
  const [retweets, setRetweets]            = useState(0)
  const [quoteTweets, setQuoteTweets]      = useState(0)
  const [like, setLike]                    = useState(0)
  const [image, takeScreenshot] = useScreenshot()
  const getImage  = () => {
    takeScreenshot(tweetRef.current)
  }

  useEffect(()=>{
    setLanguages(language[lang])
  },[lang])

  const avatarHandle = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.addEventListener('load', function(){
      setAvatar(this.result)
    })
    reader.readAsDataURL(file)
  }

  useEffect(()=> {
    downRef.current.click()
  },[image])

  const fetchTwitterInfo = () => {
    fetch(`https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=tayfunerbilen`)
    .then(res=>res.json())
    .then(data=> {
      const twitter = data[0];
      convertImageToBase64(twitter.profile_image_url_https, function(base64Image){
        setAvatar(base64Image)
      })
      setName(twitter.name)
      setUsername(twitter.screen_name)
      setTweet(twitter.status.text)
      setRetweets(twitter.status.retweet_count)
      setLike(twitter.status.favorite_count)
    })
  }

  return (
    <>
    <div className='tweet-settings'>
      <h3>{languages?.settings}</h3>
      <ul>
        <li>
          <label>Ad Soyad</label>
          <input type="text" className="input" value={name} onChange={(e)=>{setName(e.target.value)}} />
        </li>
        <li>
          <label>Kullanıcı Adı</label>
          <input type="text" className="input" value={username} onChange={(e)=>{setUsername(e.target.value)}} />
        </li>
        <li>
          <label>Tweet</label>
          <textarea className='textarea' maxLength="290" value={tweet} onChange={e=> setTweet(e.target.value)} />
        </li>
        <li>
          <label>Resim</label>
          <input type="file" className="input" onChange={avatarHandle} />
        </li>
        <li>
          <label>Retweet sayısı</label>
          <input type="number" className="input" value={retweets} onChange={(e)=>{setRetweets(e.target.value)}} />
        </li>
        <li>
          <label>Alıntı Tweet Sayısı</label>
          <input type="number" className="input" value={quoteTweets} onChange={(e)=>{setQuoteTweets(e.target.value)}} />
        </li>
        <li>
          <label>Like Sayısı</label>
          <input type="number" className="input" value={like} onChange={(e)=>{setLike(e.target.value)}} />
        </li>
        <li>
          <label>Doğrulanmış Hesap</label>
          <select className='input' defaultValue={isVerified} onChange={e=>setIsVerified(e.target.value)}>
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
          </select>
        </li>
        <button onClick={getImage}>Oluştur</button>
        <a href={image} id="downloads" download="tweet.png" ref={downRef} >indir</a>
      </ul>
    </div>
    <div className='tweet-container'>
      <div className='app-language'>
        <span onClick={() => {setLang('tr')}} className={lang === 'tr' && 'active'}>Türkçe</span>
        <span onClick={() => {setLang('en')}} className={lang === 'en' && 'active'}>English</span>
      </div>
      <div className='fetch-info'>
          <input  placeholder='Twitter Kullanıcı Adını Yaz' type="text" value={username} onChange={e => setUsername(e.target.value)}  />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
      </div>
    <div className="tweet" ref={tweetRef}>
        <div className='tweet-auther'>
          {avatar && <img src={avatar} /> || <MyLoader />}
          <div>
            <div className='name'>{name || "Ad-Soyad"} <span>{isVerified == 1 && <VerifedIcon />}</span></div>
            <div className='username'>@{username || "kullaniciadi"}</div>
          </div>
        </div>
        <div className='tweet-content'>
          <p dangerouslySetInnerHTML={{__html:tweet &&  tweetFormat(tweet)  || "Kullanıcı Tweet Yazısı"}} />
        </div>
        <div className='tweet-stats'>
          <span>
            <b>{formatNumber(retweets)}</b> Retweet
          </span>
          <span>
            <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
          </span>
          <span>
            <b>{formatNumber(like)}</b> Beğeni
          </span>
        </div>
        <div className='tweet-action'>
            <span><ReplyIcon /></span>
            <span><RetweetIcon /></span>
            <span><LikeIcon /></span>
            <span><ShareIcon /></span>
        </div>
    </div>
    </div>
    </>
  );
}

export default App;
