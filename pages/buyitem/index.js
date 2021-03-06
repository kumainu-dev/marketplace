import React, { useState, useEffect } from 'react';
import {
    Flex,
    Text,
    Image,
    FormLabel,
    Link,
} from '@chakra-ui/react';
import Socialbutton from '../../components/SocialButton';
import BuyModal from '../../components/BuyModal';
import ConnectModal from '../../components/ConnectModal';
import { useWallet } from 'use-wallet';
import { useRouter } from "next/router";
import BigNumber from 'bignumber.js';
import { ethers } from "ethers";

import { getMetadata } from "../../contracts/sate";
import { getAuction, getHighestBid } from "../../contracts/auction";
import { SATE_NFT_ADDRESS, SATE_AUCTION_ADDRESS } from "../../utils/const";
import { formatNumber, formatDate } from "../../lib/helper";

const BuyItem = () => {

    const wallet = useWallet();
    const router = useRouter();
    const [networkId, setNetworkId] = useState(0);
    const [tokenId, setTokenId] = useState(0);
    const [tokenInfo, setTokenInfo] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [price, setPrice] = useState("0");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [apy, setAPY] = useState(0);

    useEffect(async () => {
        loadData();
        setInterval(async () => {
            await loadData();
        }, 5000);
    }, []);

    const loadHighestBid = async () => {
        if (tokenId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            const bidInfo = await getHighestBid(SATE_AUCTION_ADDRESS[network.chainId], tokenId, provider);
            const highestBidPrice = bidInfo.bid.toString();
            if (parseFloat(highestBidPrice) > parseFloat(price)) {
                setPrice(highestBidPrice);
            }
        }
    }

    const loadData = async () => {
        const nftId = parseInt(router.query.id);
        console.log(nftId);
        setTokenId(nftId);
        if (nftId) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            setNetworkId(network.chainId);

            const metadata = await getMetadata(SATE_NFT_ADDRESS[network.chainId], nftId, provider);
            const auctionInfo = await getAuction(SATE_AUCTION_ADDRESS[network.chainId], nftId, provider);
            const bidInfo = await getHighestBid(SATE_AUCTION_ADDRESS[network.chainId], nftId, provider);
            
            console.log(auctionInfo);
            setPrice(auctionInfo.reservePrice > bidInfo.bid ? auctionInfo.reservePrice.toString() : bidInfo.bid.toString());
            setStartTime(new Date(auctionInfo.startTime * 1000));
            setEndTime(new Date(auctionInfo.endTime * 1000));
            
            if (!metadata) router.push("/");
            fetch(metadata)
            .then((response) => response.text())
            .then((infoResponse) => {
                try {
                    const jsonInfo = JSON.parse(infoResponse);

                    if (!jsonInfo || !jsonInfo.image || !jsonInfo.name || !jsonInfo.animation_url) {
                        throw new Error('Invalid json info');
                    }
                    setTokenInfo(jsonInfo);
                    if (jsonInfo.attributes[5].value == "LEO") setAPY(10);
                    else if (jsonInfo.attributes[5].value == "MEO") setAPY(15);
                    else if (jsonInfo.attributes[5].value == "GEO") setAPY(20);
                } catch (e) {
                    console.error('[INFO] Invalid tokenUri', metadata);
                }
            });
        }
    }

    const openModal = async() => {
        const current = new Date();
        if (current >= endTime) {
            alert("Auction has been ended!");
            return;
        }
        if (current < startTime) {
            alert("Auction has not started yet!");
            return;
        }

        if (!wallet || !wallet.ethereum) {
            setIsConnectOpen(true);
        } else {
            setIsOpen(true);
        }
    };

    const cloesModal = () => setIsOpen(false);

    if (!tokenInfo.name) {
        return "Loading...";
    }

    const _price = ethers.utils.formatUnits(price, "ether");
    return (
        <Flex w="100%" h="100%" pl={["none", "none", "0px", "100px", "200px"]} flexDirection={["column", "column", "row"]}>
            <Flex w={["100px", "100px", "unset"]} flexDirection={["row", "row", "column"]} h="100%" bg="#141B34" borderRadius="8px" 
                mt="50px" mr={["0px", "0px", "0px", "-25px"]} p="10px" ml="2.5rem">
                <Flex w="35px" h="35px"><Socialbutton network="twitter" /></Flex>
                <Flex w="35px" h="35px" ml={["10px", "10px", "0"]} mt={["0", "0", "10px"]}><Socialbutton network="facebook" /></Flex>
            </Flex>
            <Flex h="100%" w={["80%", "80%", "250px", "350px", "450px"]} padding="2px" borderRadius="8px" bg="linear-gradient(180deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" 
                mt={["10px", "10px", "50px"]}  ml={["2.5rem", "2.5rem", "25px", "35px", "50px"]} mr={["none", "none", "25px", "35px", "50px"]}>
                <Flex w={["100%", "100%", "250px", "350px", "450px"]} h={["300px", "300px", "250px", "350px", "450px"]} bg="#131A32" borderRadius="6px" justifyContent="center" alignItems="center">
                    <Flex w="100%" h="100%" justifyContent="center" alignItems="center">
                        <Flex w="100%" h="100%">
                                <video autoPlay loop muted
                                    style={{
                                        width: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '5px',
                                    }}
                                >
                                    <source src={tokenInfo.animation_url} type="video/mp4" />
                                </video>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
            <Flex flexDirection="column" borderLeft="solid 2px" borderColor="#131A32">
                <Flex flexDirection="column" m={["30px", "30px", "50px"]} mb="10px">
                    <Text fontSize="40px" textColor="#fff" fontWeight="400">{tokenInfo.name}</Text>
                    <Flex alignItems="center">
                        <Text fontSize="14px" fontWeight="400" textColor="#1365F1">Token ID: {tokenId}</Text>
                        <Image alt="copy addr" w="20px" h="20px" src="/item/ico_addr_copy.png" ml="1rem" />
                    </Flex>
                    <Flex mt="1rem" alignItems="center">
                        <Image alt="creator avatar" w="50px" h="50px" src="/item/img_profile.png"></Image>
                        <Flex flexDirection="column" ml="1rem">
                            <FormLabel fontSize="10px" fontWeight="300" textColor="rgba(255, 255, 255, 0.4)">BY CREATOR</FormLabel>
                            <Link href={tokenInfo.attributes[1].value} isExternal><FormLabel fontSize="14px" fontWeight="300" textColor="#fff">{tokenInfo.attributes[0].value}</FormLabel></Link>
                        </Flex>
                    </Flex>
                    <Flex fontSize={["10px", "14px", "10px", "10px", "14px"]}>
                        <Flex alignItems="center">
                            <Image alt="ico mark" w="15px" h="15px" src="/item/ico_note.png"></Image>
                            <Text ml="0.5rem" textColor="#1365F1">START: </Text>
                            <Text ml="0.5rem" textColor="#fff" fontWeight="300">{formatDate(startTime)}</Text>
                        </Flex>
                        <Flex w="1px" h="30px" bg="#1C2646" m="0 1.5rem 0 1.5rem" alignSelf="center"></Flex>
                        <Flex alignItems="center">
                            <Image alt="ico mark" w="15px" h="15px" src="/item/ico_note.png"></Image>
                            <Text ml="0.5rem" textColor="#1365F1">END: </Text>
                            <Text ml="0.5rem" textColor="#fff" fontWeight="300">{formatDate(endTime)}</Text>
                        </Flex>
                    </Flex>

                    <Flex textColor="#fff" fontSize="20px" mt="1.5rem">Attributes</Flex>
                    <Flex bg="#131A32" w="100%" borderRadius="4px" p="1rem" mt="1.5rem" flexDirection={["column", "row"]}>
                        <Flex flexDirection={["row", "column"]} mr={["1rem", "4rem", "2rem", "3rem", "4rem"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">TYPE</Flex>
                            <Flex fontWeight="300" h="100%" textColor="#fff" fontSize="14px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} alignItems="center">
                                <Image alt="ico equip type" w="20px" h="27px" src={`/item/${tokenInfo.attributes[5].value}.png`} mr="0.5rem"></Image>
                                {tokenInfo.attributes[5].value}
                            </Flex>
                        </Flex>
                        <Flex flexDirection={["row", "column"]} mr={["1rem", "4rem", "2rem", "3rem", "4rem"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">APY</Flex>
                            <Flex fontWeight="300" h="100%" textColor="#fff" fontSize="14px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} alignItems="center">{apy} %</Flex>
                        </Flex>
                        <Flex flexDirection={["row", "column"]} mr={["1rem", "4rem", "2rem", "3rem", "4rem"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">WEIGHT</Flex>
                            <Flex fontWeight="300" h="100%" textColor="#fff" fontSize="14px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} alignItems="center">{tokenInfo.attributes[2].value} kg</Flex>
                        </Flex>
                        <Flex flexDirection={["row", "column"]} mr={["1rem", "4rem", "2rem", "3rem", "4rem"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">ALTITUDE</Flex>
                            <Flex fontWeight="300" h="100%" textColor="#fff" fontSize="14px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} alignItems="center">{tokenInfo.attributes[3].value} km</Flex>
                        </Flex>
                        <Flex flexDirection={["row", "column"]} mr={["1rem", "4rem", "2rem", "3rem", "4rem"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">SPEED</Flex>
                            <Flex fontWeight="300" h="100%" textColor="#fff" fontSize="14px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} alignItems="center">{tokenInfo.attributes[4].value} mph</Flex>
                        </Flex>
                        <Flex flexDirection={["row", "column"]}>
                            <Flex fontWeight="300" textColor="rgba(255, 255, 255, 0.1)" fontSize="12px">TAGS</Flex>
                            <Flex flexDirection="row">
                                <Flex h="30px" borderRadius="15px" ml={["4rem", "0rem"]} mt={["0rem", "1rem"]} bg="linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" p="2px" alignItems="center">
                                    <Flex as="button" cursor="pointer" border="none" w="100%" h="100%" borderRadius="15px" bg="#131A32" textColor="#fff" fontSize="10px" fontWeight="300" alignItems="center" p="0 1rem 0 1rem">
                                        SATE
                                    </Flex>
                                </Flex>
                                <Flex h="30px" borderRadius="15px" ml="1rem" mt={["0rem", "1rem"]} bg="linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" p="2px" alignItems="center">
                                    <Flex as="button" cursor="pointer" border="none" w="100%" h="100%" borderRadius="15px" bg="#131A32" textColor="#fff" fontSize="10px" fontWeight="300" alignItems="center" p="0 1rem 0 1rem">
                                        {tokenInfo.attributes[5].value}
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex flexDirection="column" textColor="#fff" fontSize="20px" mt="1.5rem">
                        Description
                        <Text fontWeight="300" textColor="#fff" fontSize="14px" mt="1rem">
                            {tokenInfo.description}
                        </Text>
                    </Flex>

                    <Flex flexDirection="column" textColor="#fff" fontSize="20px" mt="1.5rem">
                        {tokenInfo.attributes[5].value} Satellite
                        <Text fontWeight="300" textColor="#fff" fontSize="14px" mt="1rem">
                            {tokenInfo.class}
                        </Text>
                    </Flex>

                </Flex>
                
                <Flex w="100%" h="100px" bg="#131A32">
                    <Flex m="20px 50px" w="100%" justifyContent="space-between" alignItems="center">
                        <Text color="#fff" fontSize="15px" fontWeight="500">CURRENT PRICE</Text>
                        <Flex flexDirection="column" alignItems="center">
                            <Flex alignItems="center">
                                <Image src="item/coin_logo.png" w="20px" h="20px" alt="coin logo"></Image>
                                <Text textColor="#FDB32A" fontSize="15px" fontWeight="500" ml="0.5rem">{formatNumber(parseFloat(_price), 1)} STARL</Text>
                            </Flex>
                        </Flex>
                        <Flex as="button" onClick={openModal} w="30%" h="60px" justifyContent="center" alignItems="center" color="#fff" fontSize="15px" fontWeight="500" bg="linear-gradient(225deg, #FDBF25, #B417EB, #0D57FF, #2D9CB4)" _hover={{ background: '#314DFF' }} border="none" _disabled={{ background: '#131A32', textColor: "rgba(255, 255, 255, 0.2)" }}>PLACE BID</Flex>
                    </Flex>
                </Flex>
            </Flex>
            <BuyModal isOpen={isOpen} onClose={cloesModal} tokenId={tokenId} />
            <ConnectModal isOpen={isConnectOpen} onClose={() => { setIsConnectOpen(false); }}/>
        </Flex>
    );
}

export default BuyItem;