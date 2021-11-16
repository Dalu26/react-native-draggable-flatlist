import React, { useContext, useEffect } from "react";
import { useMemo, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { DEFAULT_PROPS } from "../constants";
import { useProps } from "./propsContext";
import { CellData, DraggableFlatListProps } from "../types";

type RefContextValue<T> = {
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, CellData>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  containerRef: React.RefObject<Animated.View>;
  flatlistRef: React.RefObject<FlatList<T>>;
  scrollViewRef: React.RefObject<Animated.ScrollView>;
};
const RefContext = React.createContext<RefContextValue<any> | undefined>(
  undefined
);

export default function RefProvider<T>({
  children,
  flatListRef,
}: {
  children: React.ReactNode;
  flatListRef: React.ForwardedRef<FlatList<T>>;
}) {
  const value = useSetupRefs<T>({ flatListRef });
  return <RefContext.Provider value={value}>{children}</RefContext.Provider>;
}

export function useRefs<T>() {
  const value = useContext(RefContext);
  if (!value) {
    throw new Error(
      "useRefs must be called from within a RefContext.Provider!"
    );
  }
  return value as RefContextValue<T>;
}

function useSetupRefs<T>({
  flatListRef: flatListRefProp,
}: {
  flatListRef: React.ForwardedRef<FlatList<T>>;
}) {
  const props = useProps<T>();
  const { animationConfig = DEFAULT_PROPS.animationConfig } = props;

  const propsRef = useRef(props);
  propsRef.current = props;
  const animConfig = {
    ...DEFAULT_PROPS.animationConfig,
    ...animationConfig,
  } as Animated.WithSpringConfig;
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());
  const containerRef = useAnimatedRef<Animated.View>();
  const flatlistRef = useAnimatedRef<FlatList<T>>();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useEffect(() => {
    // This is a workaround for the fact that RN does not respect refs passed in
    // to renderScrollViewComponent underlying ScrollView
    //@ts-ignore
    const scrollRef = flatlistRef.current?.getNativeScrollRef();
    if (!scrollViewRef.current) {
      //@ts-ignore
      scrollViewRef(scrollRef);
    }
  }, []);

  const refs = useMemo(
    () => ({
      animationConfigRef,
      cellDataRef,
      containerRef,
      flatlistRef,
      keyToIndexRef,
      propsRef,
      scrollViewRef,
    }),
    []
  );

  return refs;
}
