import getMonstersScript from 'cadence/scripts/getMonsters';
import Button from 'components/Button';
import NFTView from 'components/NFTView/NFTView';
import { useWeb3Context } from 'contexts/Web3';
import useEmblaCarousel from 'embla-carousel-react';
import ActionPanel from 'layout/ActionPanel';
import Header from 'layout/Header';
import NavPanel from 'layout/NavPanel';
import PageContainer from 'layout/PageContainer';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import styles from 'styles/ViewPage.module.css';
import { ROUTES } from 'utils/constants';
import { GetMonstersResponse } from 'utils/types';

const View = () => {
  const router = useRouter();
  const { user, executeScript } = useWeb3Context();
  const [monsters, setMonsters] = useState<GetMonstersResponse>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  // Get monsters
  useEffect(() => {
    if (!user.addr) return;

    const getMonsters = async () => {
      const res: GetMonstersResponse = await executeScript(
        getMonstersScript,
        (arg: any, t: any) => [arg(user.addr, t.Address)],
      );
      setMonsters(res || []);
    };

    getMonsters();
  }, [executeScript, user.addr]);

  // Reinitialize carousel with response data
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, monsters]);

  // Sort monsters by itemID, in descending order (newest first)
  const descendingOrderMonsters = useMemo(
    () =>
      [...monsters].sort(
        (a, b) => parseInt(b.itemID, 10) - parseInt(a.itemID, 10),
      ),
    [monsters],
  );

  return (
    <PageContainer>
      <Header />

      <main className={styles.main}>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {descendingOrderMonsters.map(({ resourceID, component }) => {
              return (
                <div key={resourceID} className={styles.emblaSlide}>
                  <NFTView
                    bgIndex={component.background}
                    headIndex={component.head}
                    legsIndex={component.legs}
                    torsoIndex={component.torso}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <ActionPanel />

      <NavPanel>
        <Button
          src="/images/ui/create_button_off.png"
          width={640}
          height={208}
          onClick={() => router.push(ROUTES.CREATE)}
          alt="Create NFT"
        />

        <Button
          src="/images/ui/view_button_on.png"
          width={640}
          height={208}
          inactive
          alt="View NFTs"
        />
      </NavPanel>
    </PageContainer>
  );
};

export default View;
