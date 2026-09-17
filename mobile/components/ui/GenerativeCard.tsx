import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PREMIUM } from '../../constants/premiumUI';
import { sf } from '../../utils/responsive';
import { resolvePalette, type CardHue, type CardPalette } from '../../utils/cardPalette';
import CardIllustration, { type IllustrationVariant } from './CardIllustration';
import PressableScale from './PressableScale';
import StaggerIn from '../shared/StaggerIn';

/**
 * Self-generating visual card.
 *
 * Give it a `seed` (entry id, title, category) or a `hue`, and it derives the
 * pastel gradient, ink colours, an inline avatar chip and a bespoke procedural
 * illustration. Every card in the app can share this material while still
 * looking hand-made.
 */

export type GenerativeCardVariant = 'hero' | 'row' | 'tile' | 'plain';

type Props = {
  /** Stable identity — drives palette (when no hue) and illustration layout. */
  seed?: string;
  hue?: CardHue | number;
  /** Override the generated palette entirely. */
  palette?: CardPalette;
  variant?: GenerativeCardVariant;
  illustration?: IllustrationVariant | 'auto' | 'none';
  /** Illustration opacity — drop for text-dense cards. */
  illustrationOpacity?: number;

  eyebrow?: string;
  title?: string;
  subtitle?: string;
  titleLines?: number;
  subtitleLines?: number;

  /** Emoji / short text avatar rendered in a frosted chip. */
  avatar?: string;
  /** Remote or local image avatar. */
  avatarUri?: string;
  /** Fully custom avatar node. */
  avatarNode?: React.ReactNode;
  /** Trailing chevron for navigational rows. */
  chevron?: boolean;

  /** Custom body rendered beneath title/subtitle (or alone when no title). */
  children?: React.ReactNode;
  /** Footer row rendered below content (badges, CTAs). */
  footer?: React.ReactNode;

  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;

  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  minHeight?: number;
  /** Stagger entrance delay in ms; omit to render without entrance motion. */
  enterDelay?: number;
  accessibilityLabel?: string;
};

export function useGenerativePalette(seed: string | undefined, hue?: CardHue | number, override?: CardPalette): CardPalette {
  return useMemo(() => override ?? resolvePalette({ hue, seed }), [seed, hue, override]);
}

export default function GenerativeCard({
  seed,
  hue,
  palette: paletteOverride,
  variant = 'plain',
  illustration = 'auto',
  illustrationOpacity,
  eyebrow,
  title,
  subtitle,
  titleLines,
  subtitleLines,
  avatar,
  avatarUri,
  avatarNode,
  chevron = false,
  children,
  footer,
  onPress,
  onLongPress,
  disabled,
  style,
  contentStyle,
  minHeight,
  enterDelay,
  accessibilityLabel,
}: Props) {
  const resolvedSeed = seed ?? title ?? 'insight';
  const palette = useGenerativePalette(resolvedSeed, hue, paletteOverride);

  const isHero = variant === 'hero';
  const isRow = variant === 'row';
  const isTile = variant === 'tile';

  const showArt = illustration !== 'none' && variant !== 'plain';
  const artOpacity = illustrationOpacity ?? (isHero ? 1 : isTile ? 0.9 : 0.75);

  const hasAvatar = Boolean(avatar || avatarUri || avatarNode);

  const avatarChip = hasAvatar ? (
    <View style={[styles.avatarChip, isRow && styles.avatarChipRow, { backgroundColor: palette.surface }]}>
      {avatarNode ? (
        avatarNode
      ) : avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.avatarEmoji, isRow && styles.avatarEmojiRow]}>{avatar}</Text>
      )}
    </View>
  ) : null;

  const textBlock = (title || subtitle || eyebrow) ? (
    <View style={[styles.textBlock, isRow && styles.textBlockRow]}>
      {eyebrow ? <Text style={[styles.eyebrow, { color: palette.muted }]}>{eyebrow}</Text> : null}
      {title ? (
        <Text
          style={[
            styles.title,
            isHero && styles.titleHero,
            isRow && styles.titleRow,
            isTile && styles.titleTile,
            { color: palette.ink },
          ]}
          numberOfLines={titleLines}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={[styles.subtitle, isRow && styles.subtitleRow, { color: palette.muted }]}
          numberOfLines={subtitleLines}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : null;

  const body = (
    <LinearGradient
      colors={palette.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        isHero && styles.cardHero,
        isTile && styles.cardTile,
        minHeight != null && { minHeight },
      ]}
    >
      {showArt ? (
        <CardIllustration
          seed={resolvedSeed}
          palette={palette}
          variant={illustration === 'auto' ? 'auto' : illustration}
          opacity={artOpacity}
          align={isRow ? 'right' : 'bottom'}
          style={isRow ? styles.artRow : isHero ? styles.artHero : styles.artTile}
        />
      ) : null}

      {/* Top sheen — keeps text legible over the art */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
        locations={[0, 0.45, 1]}
        style={styles.sheen}
      />

      <View style={[styles.content, isRow && styles.contentRow, isHero && styles.contentHero, contentStyle]}>
        {isRow ? (
          <>
            {avatarChip}
            <View style={styles.rowMain}>
              {textBlock}
              {children}
            </View>
            {chevron ? <Ionicons name="chevron-forward" size={20} color={palette.ink} style={styles.chevron} /> : null}
          </>
        ) : (
          <>
            {hasAvatar ? <View style={styles.avatarRowTop}>{avatarChip}</View> : null}
            {textBlock}
            {children}
            {isHero ? <View style={styles.heroSpacer} /> : null}
          </>
        )}
        {footer ? <View style={[styles.footer, isRow && styles.footerRow]}>{footer}</View> : null}
      </View>
    </LinearGradient>
  );

  const shell = onPress || onLongPress ? (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={[styles.shell, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      scaleTo={isRow ? 0.975 : 0.965}
    >
      {body}
    </PressableScale>
  ) : (
    <View style={[styles.shell, style]}>{body}</View>
  );

  if (enterDelay == null) return shell;
  return <StaggerIn delay={enterDelay}>{shell}</StaggerIn>;
}

const TITLE: TextStyle = {
  fontSize: sf(18),
  fontWeight: '800',
  letterSpacing: -0.4,
  lineHeight: sf(23),
};

const styles = StyleSheet.create({
  shell: {
    borderRadius: PREMIUM.radius.card,
    ...(PREMIUM.shadow.soft as object),
    shadowOpacity: 0.10,
    shadowColor: '#6B4987',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  card: {
    borderRadius: PREMIUM.radius.card,
    overflow: 'hidden',
  },
  cardHero: {
    minHeight: 236,
  },
  cardTile: {
    minHeight: 160,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  artHero: {
    top: '32%',
  },
  artTile: {
    top: '40%',
  },
  artRow: {
    left: '48%',
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: PREMIUM.layout.cardInnerPadH + 2,
    paddingVertical: PREMIUM.layout.cardInnerPadV + 4,
  },
  contentHero: {
    paddingTop: 22,
    paddingBottom: 22,
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  heroSpacer: {
    flexGrow: 1,
    minHeight: 64,
  },
  avatarRowTop: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  avatarChip: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarChipRow: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  avatarEmojiRow: {
    fontSize: 22,
  },
  textBlock: {
    gap: 4,
  },
  textBlockRow: {
    gap: 2,
  },
  eyebrow: {
    fontSize: sf(11),
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: TITLE,
  titleHero: {
    fontSize: sf(26),
    lineHeight: sf(31),
    letterSpacing: -0.7,
    maxWidth: '92%',
  },
  titleRow: {
    fontSize: sf(16),
    lineHeight: sf(21),
    letterSpacing: -0.3,
  },
  titleTile: {
    fontSize: sf(19),
    lineHeight: sf(24),
  },
  subtitle: {
    fontSize: sf(14.5),
    lineHeight: sf(21),
    fontWeight: '500',
  },
  subtitleRow: {
    fontSize: sf(13),
    lineHeight: sf(18),
  },
  chevron: {
    marginLeft: 4,
    opacity: 0.8,
  },
  footer: {
    marginTop: 16,
  },
  footerRow: {
    marginTop: 0,
  },
});
