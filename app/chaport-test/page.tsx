"use client";

import Script from "next/script";

export default function ChaportTest() {
  return (
    <>
      <Script id="chaport-chat" strategy="afterInteractive">
        {`
          (function(w,d,v3){
            w.chaportConfig = {
              appId: '6a390ff1a2cd2e39938a1ec3'
            };

            if(w.chaport)return;
            v3=w.chaport={};
            v3._q=[];
            v3._l={};
            v3.q=function(){v3._q.push(arguments)};
            v3.on=function(e,fn){
              if(!v3._l[e])v3._l[e]=[];
              v3._l[e].push(fn)
            };

            var s=d.createElement('script');
            s.type='text/javascript';
            s.async=true;
            s.src='https://app.chaport.com/javascripts/insert.js';

            var ss=d.getElementsByTagName('script')[0];
            ss.parentNode.insertBefore(s,ss);
          })(window, document);
        `}
      </Script>

      <div style={{ padding: 20 }}>
        <h1>MSpace Chaport Test</h1>
        <p>If the chat bubble appears, Chaport is loading correctly.</p>
      </div>
    </>
  );
}