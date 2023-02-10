// 트랜잭션 객체(txOBject)를 만드는 주체는 누가 되어야 할 것인가에 대한 의문점이 생긴다.
// 1. 프론트에서 메타마스크에게 다이렉트로 요청을 보내 트랜잭션을 발생시키는 방법
// 2. 백엔드에서 서명을 제외한 트랜잭션 객체를 만든 다음 프론트에 전달하고, 프론트에서는 백엔드로부터 전달받은 트랜잭션 객체를 메타마스크에게 전달해 메타마스크에서 서명과 함께 트랜잭션 발생시키는 방법 (옵션에 따라 상ㄴ품 가격이 변동되는 경우 이와 같은 로직을 주로 사용함)
// 3. 백엔드에서 사용자의 개인키를 이용해 서명을 만들고 서명까지 포함된 완전한 트랜잭션 객체를 만들어 블록체인 네트워크에게 다이렉트로 요청하는 방법
//
// 하지만 3번과 같은 방식은 백엔드 서버 쪽에서 사용자의 개인키를 DB 같은 곳에 보관해 놓고 있다가 사용자로부터 요청이 들어왔을 때 개인키를 사용해 서명을 만들어주는 방식으로 굉장히 위험.
// 사용자 입장에서는 본인의 계정 비밀번호를 남에게 맡기는 것이 돼버리기 때문
// 주로 1, 2번 방식으로 디앱을 만들게 되며, 중요한 포인트는 사용자의 개인키를 이용해 서명을 만드는 주체는 우리가 아닌 메타마스크가 된다는 점

// 본격적으로 create-react-app을 이용해 프론트 쪽 만들기
// src/ 디렉토리 아래에 hooks 디렉토리를 만들어 useWeb3.js 파일 만들어주기

import { useEffect, useState } from "react";
import Web3 from "web3/dist/web3.min.js";
// web3 라이브러리 안에는 브라우저가 아닌 node.js에서만 사용 가능한 라이브러리들이 존재
// webpack 설정을 잡아주거나 최소 기능만을 가져오는 방법으로 해결

const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  const getChainId = async () => {
    const chainId = await window.ethereum.request({
      // 메타마스크가 사용하고 있는 네트워크의 체인 아이디를 return
      method: "eth_chainId",
    });

    return chainId;
  };

  const getRequestAccounts = async () => {
    const accounts = await window.ethereum.request({
      // 연결이 안 되었다면 메타마스크 내의 계정들과 연결 요청
      // 연결이 되었다면 메타마스크가 갖고 있는 계정들 중 사용하고 있는 계정 가져오기
      method: "eth_requestAccounts",
    });

    console.log(accounts);

    return accounts;
  };

  const addNetwork = async (_chainId) => {
    // 메타마스크에서 네트워크 추가할 때 들어가는 속성들
    const network = {
      chainId: _chainId,
      chainName: "Ganache",
      rpcUrls: ["http://127.0.0.1:8545"],
      nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH", // 통화 단위
        decimals: 18, // 소수점 자리수
      },
    };

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [network],
    });
  };

  // window 객체에 대한 접근은 모든 요소들이 렌더 완료되었을 때 하는 것이 효과적
  useEffect(() => {
    const init = async () => {
      try {
        const targetChainId = "0x4d2";
        const chainId = await getChainId(); // 1234, hex: 0x4d2
        console.log("체인 아이디 : ", chainId);
        if (targetChainId !== chainId) {
          // 네트워크 추가하는 코드
          addNetwork(targetChainId);
        }

        const [accounts] = await getRequestAccounts();

        // web3 라이브러리를 메타마스크에 연결 (맵핑)
        const web3 = new Web3(window.ethereum);
        setAccount(accounts);
        setWeb3(web3);
      } catch (e) {
        console.error(e.message);
      }
    };

    if (window.ethereum) {
      // 메타마스크 설치된 클라이언트
      // window.ethereum.request() : 메타마스크에 요청 보내는 메소드
      // RPC 사용
      init();
    }
  }, []);

  return [account, web3];
};

export default useWeb3;
