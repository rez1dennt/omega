<?php
defined( 'ABSPATH' ) || exit;
$ui = omega_theme_pitch_ui();
$pitch_data = omega_theme_pitch_data();
$method_values = array( 'source' => $pitch_data['lenoxSource']['name'], 'min_wall' => str_replace( '.', ',', (string) $pitch_data['lenoxSource']['minWall'] ), 'max_wall' => str_replace( '.', ',', (string) $pitch_data['lenoxSource']['maxWall'] ) );
$text = static function ( string $key, array $values = array() ) use ( $ui, $method_values ): string {
    $replacements = array();
    foreach ( array_merge( $method_values, $values ) as $name => $value ) {
        $replacements[ '{' . $name . '}' ] = (string) $value;
    }
    return strtr( $ui[ $key ] ?? '', $replacements );
};
$number = static function ( $value ): string { return str_replace( '.', ',', (string) $value ); };
?>
<section class="pitch-section" id="pitch-guide" aria-labelledby="pitch-title" tabindex="-1"><div class="container">
    <div class="section-heading pitch-heading"><div><p class="eyebrow"><?php echo esc_html( $text( 'eyebrow_1' ) ); ?></p><h2 id="pitch-title"><?php echo esc_html( $text( 'heading_1' ) ); ?><br><?php echo esc_html( $text( 'heading_2' ) ); ?></h2></div><p><?php echo esc_html( $text( 'paragraph_1' ) ); ?><br><?php echo esc_html( $text( 'paragraph_2' ) ); ?></p></div>
    <div class="pitch-card">
        <div class="pitch-tabs" role="tablist" aria-label="<?php echo esc_attr( $text( 'tablist_label' ) ); ?>" hidden><button id="pitch-tab-rod" type="button" role="tab" aria-controls="pitch-panel-rod" aria-selected="true"><?php echo esc_html( $text( 'label_1' ) ); ?></button><button id="pitch-tab-pipe" type="button" role="tab" aria-controls="pitch-panel-pipe" aria-selected="false" tabindex="-1"><?php echo esc_html( $text( 'label_2' ) ); ?></button></div>
        <div id="pitch-panel-rod" class="pitch-panel" aria-labelledby="pitch-rod-heading"><h3 id="pitch-rod-heading" class="pitch-panel-heading"><?php echo esc_html( $text( 'heading_3' ) ); ?></h3>
            <div class="pitch-workbench" hidden><div class="pitch-controls" role="group" aria-label="<?php echo esc_attr( $text( 'rod_group_label' ) ); ?>"><div class="pitch-field"><label for="pitch-rod-diameter"><?php echo esc_html( $text( 'label_3' ) ); ?></label><input id="pitch-rod-diameter" type="text" inputmode="decimal" maxlength="9" autocomplete="off" placeholder="<?php echo esc_attr( $text( 'rod_placeholder' ) ); ?>" aria-describedby="pitch-rod-diameter-error"><p id="pitch-rod-diameter-error" class="pitch-field-error" hidden></p></div><button class="button pitch-find" type="button"><?php echo esc_html( $text( 'label_4' ) ); ?><?php echo omega_theme_icon( 'pitch_arrow', 'arrow' ); ?></button></div><div class="pitch-result"><p class="pitch-result-label"><?php echo esc_html( $text( 'paragraph_3' ) ); ?></p><p class="pitch-status" role="status" aria-live="polite"><?php echo esc_html( $text( 'paragraph_4' ) ); ?></p><div class="pitch-choices"></div><p class="pitch-result-note"><?php echo esc_html( $text( 'paragraph_5' ) ); ?></p></div></div>
            <p class="pitch-overlap"><?php echo esc_html( $text( 'paragraph_6' ) ); ?></p>
            <details class="pitch-reference"><summary><?php echo esc_html( $text( 'label_5' ) ); ?><?php echo omega_theme_icon( 'pitch_chevron', 'chevron' ); ?></summary><div class="pitch-table-wrap"><table class="pitch-rod-table"><caption class="visually-hidden"><?php echo esc_html( $text( 'rod_caption' ) ); ?></caption><thead><tr><th scope="col"><?php echo esc_html( $text( 'diameter_column' ) ); ?></th><th scope="col"><?php echo esc_html( $text( 'pitch_column' ) ); ?></th></tr></thead><tbody>
                <?php foreach ( $pitch_data['rodRanges'] as $index => $range ) : ?>
                    <tr data-rod-index="<?php echo esc_attr( $index ); ?>"><th scope="row"><?php echo esc_html( $range['label'] ); ?></th><td><?php echo esc_html( $range['pitch'] ); ?></td></tr>
                <?php endforeach; ?>
            </tbody></table></div></details>
        </div>
        <div id="pitch-panel-pipe" class="pitch-panel" aria-labelledby="pitch-pipe-heading"><h3 id="pitch-pipe-heading" class="pitch-panel-heading"><?php echo esc_html( $text( 'heading_4' ) ); ?></h3>
            <div class="pitch-workbench" hidden><div class="pitch-controls" role="group" aria-label="<?php echo esc_attr( $text( 'pipe_group_label' ) ); ?>">
                <div class="pitch-field"><label for="pitch-pipe-diameter"><?php echo esc_html( $text( 'label_6' ) ); ?></label><input id="pitch-pipe-diameter" type="text" inputmode="decimal" maxlength="9" autocomplete="off" placeholder="<?php echo esc_attr( $text( 'diameter_placeholder' ) ); ?>" aria-describedby="pitch-pipe-diameter-error"><p id="pitch-pipe-diameter-error" class="pitch-field-error" hidden></p></div>
                <div class="pitch-field"><label for="pitch-pipe-wall"><?php echo esc_html( $text( 'label_7' ) ); ?></label><input id="pitch-pipe-wall" type="text" inputmode="decimal" maxlength="9" autocomplete="off" placeholder="<?php echo esc_attr( $text( 'wall_placeholder' ) ); ?>" aria-describedby="pitch-pipe-wall-error"><p id="pitch-pipe-wall-error" class="pitch-field-error" hidden></p></div>
                <label class="pitch-adjacent"><input id="pitch-pipe-adjacent" type="checkbox"><span><?php echo esc_html( $text( 'label_8' ) ); ?></span></label><button class="button pitch-find" type="button"><?php echo esc_html( $text( 'label_9' ) ); ?><?php echo omega_theme_icon( 'pitch_arrow', 'arrow' ); ?></button>
            </div><div class="pitch-result"><p class="pitch-result-label"><?php echo esc_html( $text( 'paragraph_7' ) ); ?></p><p class="pitch-status" role="status" aria-live="polite"><?php echo esc_html( $text( 'paragraph_8' ) ); ?></p><div class="pitch-choices"></div><p class="pitch-result-note"><?php echo esc_html( $text( 'paragraph_9' ) ); ?></p></div></div>
            <p class="pitch-overlap"><?php echo esc_html( $text( 'paragraph_10' ) ); ?></p>
            <details class="pitch-reference"><summary><?php echo esc_html( $text( 'label_10' ) ); ?><?php echo omega_theme_icon( 'pitch_chevron', 'chevron' ); ?></summary><p class="pitch-scroll-hint"><?php echo esc_html( $text( 'paragraph_11' ) ); ?></p><div class="pitch-table-wrap pitch-pipe-scroll" role="region" tabindex="0" aria-label="<?php echo esc_attr( $text( 'pipe_region_label' ) ); ?>"><table class="pitch-pipe-table"><caption class="visually-hidden"><?php echo esc_html( $text( 'pipe_caption' ) ); ?></caption><thead><tr><th scope="col"><?php echo esc_html( $text( 'wall_column' ) ); ?></th>
                <?php foreach ( $pitch_data['pipeDiameters'] as $diameter ) : ?><th scope="col"><?php echo esc_html( $number( $diameter ) ); ?></th><?php endforeach; ?>
            </tr></thead><tbody>
                <?php foreach ( $pitch_data['pipeWalls'] as $row => $wall ) : ?>
                    <tr><th scope="row"><?php echo esc_html( $number( $wall ) ); ?></th>
                        <?php foreach ( $pitch_data['pipeDiameters'] as $column => $diameter ) : $pitch = $pitch_data['pipePitches'][ $row ][ $column ]; ?>
                            <td data-pipe-row="<?php echo esc_attr( $row ); ?>" data-pipe-column="<?php echo esc_attr( $column ); ?>"<?php if ( null === $pitch ) : ?> aria-label="<?php echo esc_attr( $text( 'no_data' ) ); ?>"<?php endif; ?>><?php echo esc_html( null === $pitch ? $text( 'empty_cell' ) : $pitch ); ?></td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            </tbody></table></div></details>
        </div>
    </div>
    <details class="pitch-break-in"><summary><span><?php echo esc_html( $text( 'label_11' ) ); ?></span><?php echo esc_html( $text( 'label_12' ) ); ?><?php echo omega_theme_icon( 'pitch_chevron', 'chevron' ); ?></summary><p><?php echo esc_html( $text( 'paragraph_12' ) ); ?></p></details>
</div></section>
