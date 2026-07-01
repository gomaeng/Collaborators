window.addEventListener("DOMContentLoaded", () => {
    
    /* 1. 사이드 메뉴 클릭 시 색상 유지 */
    const menuLinks = document.querySelectorAll(".side-menu a");
    menuLinks.forEach(link => {
        link.addEventListener("click", function() {
            if (this.classList.contains("menu-logo")) return;
            menuLinks.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
        });
    });

    /* 2. 동적 쇼케이스 유튜브 슬라이더 기능 (영상이 홀수여도 자동 대응) */
    const track = document.getElementById("dynamic-track");
    const dotsContainer = document.querySelector(".showcase-dots");
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");

    if (track && dotsContainer) {
        // 1) 기존 영상 아이템들을 배열로 수집한 후 트랙 비우기
        const videos = Array.from(track.querySelectorAll(".video-wrapper"));
        track.innerHTML = ""; 

        const itemsPerSlide = 2; // 한 화면에 보여줄 영상 개수
        let slideIndex = 0;

        // 2) 영상을 2개씩 쪼개서 새로운 슬라이드 묶음(.dynamic-slide) 만들기
        for (let i = 0; i < videos.length; i += itemsPerSlide) {
            const slideChunk = videos.slice(i, i + itemsPerSlide);
            
            const slideDiv = document.createElement("div");
            slideDiv.className = "dynamic-slide";
            if (slideIndex === 0) slideDiv.classList.add("active");

            // 영상 넣기
            slideChunk.forEach(vid => slideDiv.appendChild(vid));

            // [핵심] 만약 영상이 홀수라 마지막 슬라이드에 1개만 남았다면 투명 박스를 채워줌
            if (slideChunk.length < itemsPerSlide) {
                const placeholder = document.createElement("div");
                placeholder.className = "video-placeholder";
                slideDiv.appendChild(placeholder);
            }

            track.appendChild(slideDiv);
            slideIndex++;
        }

        // 3) 만들어진 슬라이드들을 기반으로 내비게이션 제어
        const slides = track.querySelectorAll(".dynamic-slide");
        let current = 0;
        let players = [];

        // 도트 생성
        slides.forEach((_, index) => {
            const dot = document.createElement("span");
            dot.className = "dot";
            if (index === 0) dot.classList.add("active");
            dot.onclick = () => {
                current = index;
                showSlide(current);
            };
            dotsContainer.appendChild(dot);
        });

        function showSlide(index) {
            const dots = dotsContainer.querySelectorAll(".dot");
            slides.forEach(slide => slide.classList.remove("active"));
            dots.forEach(dot => dot.classList.remove("active"));

            slides[index].classList.add("active");
            if (dots[index]) dots[index].classList.add("active");

            // 슬라이드 이동 시 재생 중인 영상들 일시정지
            players.forEach(player => {
                if (player && typeof player.pauseVideo === 'function') {
                    player.pauseVideo();
                }
            });
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                current = (current + 1) % slides.length;
                showSlide(current);
            };
        }
        if (prevBtn) {
            prevBtn.onclick = () => {
                current--;
                if (current < 0) current = slides.length - 1;
                showSlide(current);
            };
        }

        // 유튜브 API 연동
        window.onYouTubeIframeAPIReady = function() {
            const iframes = track.querySelectorAll("iframe");
            iframes.forEach((iframe, index) => {
                players[index] = new YT.Player(iframe.id, {
                    events: {
                        onReady: (event) => {
                            event.target.mute();
                            const videoId = event.target.getVideoData().video_id;
                            if (videoId) {
                                event.target.cueVideoById({ videoId: videoId, startSeconds: 0 });
                            }
                        }
                    }
                });
            });
        };

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    /* 3. 이미지 및 비디오 우클릭 방지 */
    const mediaElements = document.querySelectorAll("img, video");
    mediaElements.forEach(element => {
        element.addEventListener("contextmenu", function(e) {
            e.preventDefault();
        });
    });
});
