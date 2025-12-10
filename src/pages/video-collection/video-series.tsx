import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { Link } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import SearchInput from "@/components/search-input";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Info from "./info";

/** 视频合集 */
const VideoSeries = () => {
  const { id } = useParams();
  const collectedFolder = useUser(state => state.collectedFolder);

  const isCollected = collectedFolder?.some(item => item.id === Number(id));
  const displayMode = useSettings(state => state.displayMode);
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addList = usePlayList(state => state.addList);

  // 搜索功能
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMedias, setFilteredMedias] = useState<any[]>([]);

  const { data, loading, refreshAsync } = useRequest(
    async () => {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });
      return res?.data;
    },
    {
      ready: Boolean(id),
      refreshDeps: [id],
    },
  );

  const onPlayAll = () => {
    if (Array.isArray(data?.medias)) {
      playList(
        data.medias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  // 过滤媒体列表
  useEffect(() => {
    const medias = data?.medias ?? [];

    if (searchKeyword) {
      const filtered = medias.filter(
        item =>
          (item.title && item.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          (item.upper?.name && item.upper.name.toLowerCase().includes(searchKeyword.toLowerCase())),
      );
      setFilteredMedias(filtered);
    } else {
      setFilteredMedias(medias);
    }
  }, [searchKeyword, data?.medias]);

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const addToPlayList = () => {
    if (Array.isArray(data?.medias)) {
      addList(
        data.medias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const renderMediaItem = (item: any) => (
    <MediaItem
      key={item.bvid}
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={String(item.id)}
      title={item.title}
      playCount={item.cnt_info.play}
      cover={item.cover}
      ownerName={item.upper?.name}
      ownerMid={item.upper?.mid}
      duration={item.duration as number}
      footer={
        displayMode === "card" &&
        !isCollected && (
          <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
            <Link href={`/user/${item.upper?.mid}`} className="text-foreground-500 text-sm hover:underline">
              {item.upper?.name}
            </Link>
            <span>{formatDuration(item.duration as number)}</span>
          </div>
        )
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerName: item.upper?.name,
          ownerMid: item.upper?.mid,
        })
      }
    />
  );

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-shrink-0">
          <Info
            loading={loading}
            type={CollectionType.VideoSeries}
            title={data?.info?.title}
            desc={data?.info?.intro}
            cover={data?.info?.cover}
            upMid={data?.info?.upper?.mid}
            upName={data?.info?.upper?.name}
            mediaCount={data?.info?.media_count}
            afterChangeInfo={refreshAsync}
            onPlayAll={onPlayAll}
            onAddToPlayList={addToPlayList}
          />
        </div>
        <div className="ml-4 flex h-[230px] flex-col justify-end">
          <SearchInput placeholder="搜索当前系列的视频..." onSearch={handleSearch} debounceDelay={300} maxWidth={350} />
        </div>
      </div>
      {displayMode === "card" ? (
        <GridList
          enablePagination={!searchKeyword}
          data={filteredMedias}
          loading={loading}
          itemKey="bvid"
          renderItem={renderMediaItem}
        />
      ) : (
        <div className="space-y-2">{filteredMedias.map(renderMediaItem)}</div>
      )}
    </>
  );
};

export default VideoSeries;
